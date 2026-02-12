from fastapi import FastAPI, Depends, HTTPException, Body, Response
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import desc
from fastapi.encoders import jsonable_encoder
from typing import Optional


from db import Base, engine, SessionLocal
from models import (
    User, 
    UserProfile, 
    TrainingPlan, 
    DailyWorkout, 
    DailyNutritionLog, 
    DailySleepLog
)


from services.nutrition import NutritionCalculator
from services.generator import TrainingPlanGenerator 
from services.GeminiLLM import chat_with_gemini
from services.PDFGenerator import generate_weekly_pdf, generate_nutrition_pdf

from schemas import (
    UserCreate,
    UserLogin,
    VerifyEmailRequest,
    ProfileCreate,
    ResendOTPRequest,
    GeneratePlanRequest,
    TrainingPlanResponse,
    LogNutrition,
    ChatRequest,
    CompleteWorkoutRequest,
    SleepLogCreate,    
    SleepLogResponse,
    DashboardStatsResponse
)

from auth import (
    hash_password,
    verify_password,
    create_token,
    generate_verification_code_with_expiration,
    get_current_user,
)
from email_utils import send_verification_email


Base.metadata.create_all(bind=engine)

app = FastAPI()


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



@app.post("/signup")
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    age = (date.today() - user.birthdate).days // 365
    if age < 15:
        raise HTTPException(status_code=400, detail="Must be at least 15 years old")

    if existing_user:
        if existing_user.is_verified:
            raise HTTPException(status_code=400, detail="Email already registered")

        code, expires_at = generate_verification_code_with_expiration()
        existing_user.verification_code = code
        existing_user.verification_expires_at = expires_at
        db.commit()

        try:
            await send_verification_email(existing_user.email, code)
        except Exception as e:
            print(f"Email failed: {e}")
            
        return {"message": "Verification code resent"}

    code, expires_at = generate_verification_code_with_expiration()
    new_user = User(
        email=user.email,
        hashed_password=hash_password(user.password),
        first_name=user.first_name,
        last_name=user.last_name,
        birthdate=user.birthdate,
        verification_code=code,
        verification_expires_at=expires_at,
        is_verified=False,
    )

    db.add(new_user)
    db.commit()

    try:
        await send_verification_email(user.email, code)
    except Exception as e:
        print(f"Email failed: {e}")

    return {"message": "Signup successful. Check your email for verification code."}

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not db_user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified")

    token = create_token(db_user.email)
    return {"access_token": token}

@app.post("/verify-email")
def verify_email(data: VerifyEmailRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid request")

    
    if str(user.verification_code) != str(data.code):
        raise HTTPException(status_code=400, detail="Invalid code")

    if not user.verification_expires_at:
        raise HTTPException(status_code=400, detail="No active verification code")

    if datetime.utcnow() > user.verification_expires_at:
        raise HTTPException(status_code=400, detail="Code expired")

    user.is_verified = True
    user.verification_code = None
    user.verification_expires_at = None
    user.resend_available_at = None
    db.commit()

    token = create_token(user.email)
    return {"access_token": token}


@app.post("/resend-otp")
async def resend_otp(data: ResendOTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or user.is_verified:
        raise HTTPException(status_code=400, detail="Invalid request")

    if user.resend_available_at and datetime.utcnow() < user.resend_available_at:
        raise HTTPException(status_code=429, detail="Please wait before requesting another code")

    code, expires_at = generate_verification_code_with_expiration()
    user.verification_code = code
    user.verification_expires_at = expires_at
    user.resend_available_at = datetime.utcnow() + timedelta(seconds=60)
    db.commit()
    
    try:
        await send_verification_email(user.email, code)
    except Exception as e:
        print(f"Email failed: {e}")

    return {"message": "OTP resent"}

@app.get("/me")
def get_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "profile_complete": profile.is_complete if profile else False,
        "profile": profile
    }



@app.post("/profile")
def create_profile(
    data: ProfileCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if existing:
         raise HTTPException(status_code=400, detail="Profile already exists")

    profile = UserProfile(
        user_id=user.id,
        **data.dict(),
        is_complete=True,
    )
    db.add(profile)
    
    user.profile_complete = True 
    db.commit()
    db.refresh(profile)
    return {"message": "Profile completed"}

@app.get("/profile")
def get_profile(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@app.put("/profile")
def update_profile(
    profile_data: ProfileCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing_profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    
    if not existing_profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = profile_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(existing_profile, key, value)

    db.commit()
    db.refresh(existing_profile)
    
    return {"status": "success", "profile": existing_profile}

@app.get("/profile/status")
def profile_status(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    return {"profile_exists": bool(profile and profile.is_complete)}



@app.post("/plans/generate", response_model=TrainingPlanResponse)
def generate_plan(
    request: GeneratePlanRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile or not profile.is_complete:
        raise HTTPException(status_code=400, detail="Profile setup required before generating a plan.")

    generator = TrainingPlanGenerator(user_profile=profile, start_date=request.start_date)
    plan_model, workout_models = generator.generate_plan()

    plan_model.user_id = user.id
    db.add(plan_model)
    db.commit()      
    db.refresh(plan_model)

    for w in workout_models:
        w.plan_id = plan_model.id 
        db.add(w)
    
    db.commit()
    return plan_model

@app.get("/plans/latest", response_model=TrainingPlanResponse)
def get_latest_plan(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = (
        db.query(TrainingPlan)
        .filter(TrainingPlan.user_id == user.id)
        .order_by(desc(TrainingPlan.created_at))
        .first()
    )
    
    if not plan:
        raise HTTPException(status_code=404, detail="No active plan found")
    
    plan.workouts.sort(key=lambda x: x.date)
    return plan

@app.get("/workouts/{workout_id}/zwo")
def download_zwo(
    workout_id: int, 
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    workout = db.query(DailyWorkout).join(TrainingPlan).filter(
        DailyWorkout.id == workout_id,
        TrainingPlan.user_id == user.id 
    ).first()
    
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found or access denied")
        
    if not workout.zwo_content:
        raise HTTPException(status_code=400, detail="No ZWO file available for this workout type")

    filename = f"{workout.date}_{workout.title.replace(' ', '_')}.zwo"
    
    return Response(
        content=workout.zwo_content,
        media_type="application/xml",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.put("/workouts/{workout_id}/complete")
def complete_workout(
    workout_id: int,
    data: CompleteWorkoutRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    workout = db.query(DailyWorkout).join(TrainingPlan).filter(
        DailyWorkout.id == workout_id,
        TrainingPlan.user_id == user.id
    ).first()
    
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
        
    workout.completed = True
    workout.completion_date = datetime.utcnow()
    workout.actual_duration = data.actual_duration
    workout.rpe = data.rpe
    workout.notes = data.notes
    
    db.commit()
    return {"status": "Workout logged successfully"}



@app.get("/plans/{plan_id}/nutrition-plan")
def get_nutrition_for_plan(
    plan_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(TrainingPlan).filter(
        TrainingPlan.id == plan_id, 
        TrainingPlan.user_id == user.id
    ).first()
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    calc = NutritionCalculator(user_profile=profile, user=user)
    results = []
    
    workouts = sorted(plan.workouts, key=lambda x: x.date)
    for workout in workouts:
        daily_data = calc.calculate_daily_needs(workout)
        results.append(daily_data)
        
    return results

@app.post("/nutrition/log")
def log_daily_nutrition(
    log_data: LogNutrition,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start = datetime.combine(log_data.date, datetime.min.time())
    end = start + timedelta(days=1)

    existing_log = db.query(DailyNutritionLog).filter(
        DailyNutritionLog.user_id == user.id,
        DailyNutritionLog.date >= start,
        DailyNutritionLog.date < end
    ).first()

    if existing_log:
        
        existing_log.protein_consumed = log_data.protein
        existing_log.carbs_consumed = log_data.carbs
        existing_log.fats_consumed = log_data.fats
        existing_log.water_liters = log_data.water
        existing_log.calories_consumed = log_data.calories 
    else:
        
        new_log = DailyNutritionLog(
            user_id=user.id,
            date=start, 
            protein_consumed=log_data.protein,
            carbs_consumed=log_data.carbs,
            fats_consumed=log_data.fats,
            water_liters=log_data.water,
            calories_consumed=log_data.calories 
        )
        db.add(new_log)

    db.commit()
    return {"status": "Logged successfully"}

@app.get("/nutrition/logs/week")
def get_weekly_logs(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(DailyNutritionLog).filter(
        DailyNutritionLog.user_id == user.id
    ).order_by(DailyNutritionLog.date.desc()).limit(14).all()
    return logs



@app.post("/sleep/log")
def log_sleep(
    log_data: SleepLogCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing_log = db.query(DailySleepLog).filter(
        DailySleepLog.user_id == user.id,
        DailySleepLog.date == log_data.date
    ).first()

    if existing_log:
        for key, value in log_data.dict().items():
            setattr(existing_log, key, value)
    else:
        new_log = DailySleepLog(user_id=user.id, **log_data.dict())
        db.add(new_log)
    
    db.commit()
    return {"status": "Sleep logged successfully"}

@app.get("/sleep/today", response_model=Optional[SleepLogResponse])
def get_todays_sleep(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    log = db.query(DailySleepLog).filter(
        DailySleepLog.user_id == user.id,
        DailySleepLog.date == today
    ).first()
    return log

@app.get("/sleep/history")
def get_sleep_history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetches sleep logs for the last 7 days."""
    today = date.today()
    start_date = today - timedelta(days=6)
    
    logs = db.query(DailySleepLog).filter(
        DailySleepLog.user_id == user.id,
        DailySleepLog.date >= start_date
    ).order_by(DailySleepLog.date).all()
    
    return logs


@app.post("/chat")
def chat_endpoint(
    req: ChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    def format_time(seconds):
        if not seconds: return "0m"
        m = seconds // 60
        s = seconds % 60
        return f"{m}m {s}s"

    
    today = date.today()
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    
    daily_workout = db.query(DailyWorkout).join(TrainingPlan).filter(
        TrainingPlan.user_id == user.id,
        DailyWorkout.date == today
    ).first()
    
    daily_log = db.query(DailyNutritionLog).filter(
        DailyNutritionLog.user_id == user.id,
        DailyNutritionLog.date == today
    ).first()
    
    
    sleep_log = db.query(DailySleepLog).filter(
        DailySleepLog.user_id == user.id,
        DailySleepLog.date == today
    ).first()

    nut_targets = None
    if daily_workout:
        calc = NutritionCalculator(user_profile=profile, user=user)
        nut_targets = calc.calculate_daily_needs(daily_workout)["targets"]

    active_plan = db.query(TrainingPlan).filter(TrainingPlan.user_id == user.id).order_by(desc(TrainingPlan.created_at)).first()
    
    
    weekly_context = "No active plan."
    if active_plan:
        sorted_workouts = sorted(active_plan.workouts, key=lambda x: x.date)
        lines = []
        for w in sorted_workouts:
            marker = "⬅️ TODAY" if w.date == today else ""
            status = "DONE" if w.completed else "TODO"
            lines.append(f"{w.day_of_week}: {w.title} [{status}] {marker}")
        weekly_context = "\n".join(lines)

    
    if daily_workout:
        if daily_workout.completed and daily_workout.actual_duration:
            actual_fmt = format_time(daily_workout.actual_duration)
            workout_desc = f"{daily_workout.title} (DONE). Actual Time: {actual_fmt} (Target: {daily_workout.estimated_duration_min}m). RPE: {daily_workout.rpe}/10"
        else:
            workout_desc = f"{daily_workout.title} (TODO). Target: {daily_workout.estimated_duration_min}m"
    else:
        workout_desc = "Rest Day"
    
    
    t_cals = nut_targets['calories'] if nut_targets else 2000
    t_prot = nut_targets['protein'] if nut_targets else 150
    t_carbs = nut_targets['carbs'] if nut_targets else 200
    t_fats = nut_targets['fats'] if nut_targets else 60
    
    l_prot = daily_log.protein_consumed if daily_log else 0
    l_carbs = daily_log.carbs_consumed if daily_log else 0
    l_fats = daily_log.fats_consumed if daily_log else 0
    l_water = daily_log.water_liters if daily_log else 0
    l_cals = daily_log.calories_consumed if daily_log else 0 

    nutrition_desc = (
        f"Calories: {l_cals}/{t_cals}kcal | "
        f"Macros: P:{l_prot}/{t_prot}g, C:{l_carbs}/{t_carbs}g, F:{l_fats}/{t_fats}g | "
        f"Water: {l_water}L"
    )

    
    if sleep_log:
        def fmt(val): return f"{val}h" if val is not None else "N/A"
        sleep_desc = (
            f"Total: {sleep_log.total_hours}h "
            f"(REM: {fmt(sleep_log.rem_hours)}, Deep: {fmt(sleep_log.deep_hours)}, "
            f"Core: {fmt(sleep_log.core_hours)}, Awake: {fmt(sleep_log.awake_hours)})"
        )
    else:
        sleep_desc = "No sleep logged for last night."

    
    user_goal = getattr(profile, 'primary_endurance', "General Fitness")

    system_prompt = f"""
    You are Ironclad AI, a highly intelligent and adaptive tactical performance coach.
    
    [USER CONTEXT]
    Goal: {user_goal}
    Current Phase: {active_plan.phase if active_plan else 'Maintenance'}
    
    [LIVE STATUS FOR {today}]
    • Sleep (Last Night): {sleep_desc}
    • Training: {workout_desc}
    • Nutrition: {nutrition_desc}
    
    [WEEKLY SCHEDULE]
    {weekly_context}
    
    [INSTRUCTIONS]
    1. **Be Responsive:** Do NOT output a status report unless asked. Answer only what the user asks.
    2. **Use Context Implicitly:** - If the user says "I'm tired", check the sleep data. If sleep was low, suggest a nap or lighter session.
       - If they ask "What should I eat?", check the remaining macros AND calories in the Nutrition section.
       - If they ask "How was my run?", check the Actual Time vs Target Time in Training.
    3. **Tone:** Concise, professional, elite military/athlete coach style. No fluff.
    """

    full_history = req.history + [{"role": "user", "content": req.message}]
    response_text = chat_with_gemini(system_prompt, full_history)
    
    return {"response": response_text}
@app.get("/plans/{plan_id}/export/pdf")
def export_plan_pdf(
    plan_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(TrainingPlan).filter(
        TrainingPlan.id == plan_id,
        TrainingPlan.user_id == user.id
    ).first()
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
        
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()

    pdf_bytes = generate_weekly_pdf(plan, profile)
    
    filename = f"Ironclad_Week_{plan.start_date}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@app.get("/plans/{plan_id}/export/nutrition-pdf")
def export_nutrition_pdf(
    plan_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    plan = db.query(TrainingPlan).filter(
        TrainingPlan.id == plan_id,
        TrainingPlan.user_id == user.id
    ).first()
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
        
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()

    
    calc = NutritionCalculator(user_profile=profile, user=user)
    nutrition_data = []
    
    sorted_workouts = sorted(plan.workouts, key=lambda x: x.date)
    for workout in sorted_workouts:
        daily_data = calc.calculate_daily_needs(workout)
        nutrition_data.append(daily_data)

    
    pdf_bytes = generate_nutrition_pdf(plan, profile, nutrition_data)
    
    filename = f"Nutrition_Week_{plan.start_date}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )