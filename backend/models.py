from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date, Float, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    birthdate = Column(Date)
    
    
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String, nullable=True)
    verification_expires_at = Column(DateTime, nullable=True)
    resend_available_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

   
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    plans = relationship("TrainingPlan", back_populates="user")
    nutrition_logs = relationship("DailyNutritionLog", back_populates="user")
    sleep_logs = relationship("DailySleepLog", back_populates="user")
   


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
   
    bodyweight = Column(Float, nullable=True)
    height = Column(Integer, nullable= True)
    
   
    primary_endurance = Column(String) 
    weekly_hours = Column(Float)
    preferred_rest_day = Column(String) 
    training_time_pref = Column(String, default="AM") 
    
    
    squat_max = Column(Float, nullable=True)
    deadlift_max = Column(Float, nullable=True)
    bench_max = Column(Float, nullable=True)
    press_max = Column(Float, nullable=True)
  
    endurance_metric_type = Column(String, nullable=True)
    endurance_metric_value = Column(Float, nullable=True)
    equipment_access = Column(String, nullable=True)
    cadence_pref = Column(String, nullable=True)
    injury_history = Column(String, nullable=True)
    
    is_complete = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="profile")
    goal = Column(String, nullable=True)


class TrainingPlan(Base):
    __tablename__ = "training_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    start_date = Column(Date)
    end_date = Column(Date)
    
    
    total_volume_minutes = Column(Integer)
    strength_volume_minutes = Column(Integer)
    endurance_volume_minutes = Column(Integer)
    
    phase = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="plans")
    workouts = relationship("DailyWorkout", back_populates="plan", cascade="all, delete-orphan")


class DailyWorkout(Base):
    __tablename__ = "daily_workouts"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("training_plans.id"))
    
    date = Column(Date)
    day_of_week = Column(String)
    time_of_day = Column(String)
    is_rest_day = Column(Boolean, default=False)
    
    title = Column(String)
    workout_type = Column(String)
    modality = Column(String, nullable=True)
    estimated_duration_min = Column(Integer)
    
    structure_json = Column(JSON)
    zwo_content = Column(Text, nullable=True)
    
    
    completed = Column(Boolean, default=False)
    completion_date = Column(DateTime, nullable=True)
    actual_duration = Column(Integer, nullable=True)
    rpe = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)

    plan = relationship("TrainingPlan", back_populates="workouts")
    zwo_content = Column(Text, nullable=True)

    @property
    def has_zwo(self):
        return bool(self.zwo_content)

class DailyNutritionLog(Base):
    __tablename__ = "daily_nutrition_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)

    protein_consumed = Column(Integer, default=0)
    carbs_consumed = Column(Integer, default=0)
    fats_consumed = Column(Integer, default=0)
    water_liters = Column(Float, default=0.0)
    calories_consumed = Column(Integer, default=0)

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="nutrition_logs")



class DailySleepLog(Base):
    __tablename__ = "daily_sleep_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, nullable=False)
    
    total_hours = Column(Float, nullable=False)
    
    rem_hours = Column(Float, nullable=True)
    core_hours = Column(Float, nullable=True)
    deep_hours = Column(Float, nullable=True)
    awake_hours = Column(Float, nullable=True)
    
    notes = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="sleep_logs")
