
from pydantic import BaseModel, EmailStr, validator
from datetime import date, datetime
from typing import Optional, Dict, Any, List

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    birthdate: date

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str

class ResendOTPRequest(BaseModel):
    email: EmailStr

class MeResponse(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    profile_complete: bool


class ProfileCreate(BaseModel):
    primary_endurance: str

    squat_max: Optional[float] = None
    deadlift_max: Optional[float] = None
    press_max: Optional[float] = None
    bench_max: Optional[float] = None

    endurance_metric_type: str
    endurance_metric_value: float

    bodyweight: float
    height: int
    weekly_hours: float

    training_time_pref: str 
    preferred_rest_day: str

    equipment_access: str
    cadence_pref: Optional[str] = None
    injury_history: Optional[str] = None

    goal: str
    class Config:
        from_attributes = True

    @validator('squat_max', 'deadlift_max', 'press_max', 'endurance_metric_value', 'bodyweight', 'weekly_hours', pre=True)
    def parse_empty_string_to_none_or_float(cls, value):
        if value == "" or value is None:
            return None
        return float(value)



class GeneratePlanRequest(BaseModel):
    start_date: date

class WorkoutStep(BaseModel):
    """Represents a single step in a workout (e.g., 'Main Work' or 'Interval')"""
    section: Optional[str] = None
    movement: Optional[str] = None
    type: Optional[str] = None
    duration: Optional[Any] = None 
    power: Optional[float] = None
    weight: Optional[float] = None
    sets: Optional[int] = None
    reps: Optional[Any] = None

class WorkoutResponse(BaseModel):
    id: int
    day_of_week: str
    date: date
    workout_type: str  
    title: str
    estimated_duration_min: int
    is_rest_day: bool
    actual_duration: Optional[int] = None
    structure_json: Optional[List[Dict[str, Any]]] = None 
    has_zwo: bool 

    class Config:
        from_attributes = True

class TrainingPlanResponse(BaseModel):
    id: int
    start_date: date
    end_date: date
    total_volume_minutes: int
    strength_volume_minutes: int
    endurance_volume_minutes: int
    workouts: List[WorkoutResponse]

    class Config:
        from_attributes = True

class LogNutrition(BaseModel):
    date: date
    protein: int
    carbs: int
    fats: int
    water: float
    calories: int


class ChatRequest(BaseModel):
    message: str
    history: list = []

class CompleteWorkoutRequest(BaseModel):
    actual_duration: int  
    rpe: Optional[int] = None
    notes: Optional[str] = None

   



class SleepLogCreate(BaseModel):
    date: date
    total_hours: float
    rem_hours: Optional[float] = None
    core_hours: Optional[float] = None
    deep_hours: Optional[float] = None
    awake_hours: Optional[float] = None
    notes: Optional[str] = None

class SleepLogResponse(BaseModel):
    id: int
    date: date
    total_hours: float
    rem_hours: Optional[float]
    core_hours: Optional[float]
    deep_hours: Optional[float]
    awake_hours: Optional[float]
    
    class Config:
        from_attributes = True
        

class DashboardStatsResponse(BaseModel):
    
    calories_consumed: int
    calories_target: int
    protein_consumed: int
    protein_target: int
    carbs_consumed: int
    carbs_target: int
    fats_consumed: int
    fats_target: int
    
   
    sleep_hours: float
    sleep_target: float = 8.0
    
    
    workout_minutes: int       
    workout_target_minutes: int
    workout_completed: bool
    
    class Config:
        from_attributes = True