import datetime
import math
from models import TrainingPlan, DailyWorkout, UserProfile

class TrainingPlanGenerator:
    def __init__(self, user_profile: UserProfile, start_date: datetime.date):
        self.profile = user_profile
        self.start_date = start_date
        self.days_map = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        
       
        iso_week = self.start_date.isocalendar()[1] 
        self.cycle_week = (iso_week % 4) + 1 

    def generate_plan(self):
        
        target_mins = self.profile.weekly_hours * 60
        
        
        base_template_mins = 360 
        
        
        self.scale_factor = max(0.5, min(target_mins / base_template_mins, 2.5))
        
        plan = TrainingPlan(
            user_id=self.profile.user_id,
            start_date=self.start_date,
            end_date=self.start_date + datetime.timedelta(days=6),
            total_volume_minutes=target_mins,
            strength_volume_minutes=target_mins * 0.2,
            endurance_volume_minutes=target_mins * 0.8,
            phase=f"Week {self.cycle_week} of 4"
        )
        
        workouts = []

       
        if self.cycle_week in [1, 3]:
            tuesday_focus = "Strength_Squat"
            thursday_focus = "Strength_Deadlift"
        else:
            tuesday_focus = "Strength_Bench"
            thursday_focus = "Strength_General"

        
        schedule_template = {
            "Monday": "Endurance_Recovery",
            "Tuesday": tuesday_focus,
            "Wednesday": "Endurance_Intervals",
            "Thursday": thursday_focus,
            "Friday": "Endurance_Recovery",
            "Saturday": "Endurance_Long",
            "Sunday": "Rest"
        }

        pref_rest = self.profile.preferred_rest_day
        
        if pref_rest in schedule_template and pref_rest != "Sunday":
            
            schedule_template["Sunday"] = schedule_template[pref_rest]

      
        current_date = self.start_date
        for i in range(7):
            day_name = self.days_map[current_date.weekday()]
            
           
            if day_name == pref_rest:
                workouts.append(self._create_rest_day(plan, current_date, day_name))
            else:
                
                session_type = schedule_template.get(day_name, "Rest")
                
                
                if session_type == "Rest":
                     workouts.append(self._create_rest_day(plan, current_date, day_name))
                else:
                     workout = self._create_session(plan, current_date, day_name, session_type)
                     workouts.append(workout)
            
            current_date += datetime.timedelta(days=1)

        return plan, workouts

    def _create_session(self, plan, date, day_name, session_type):
        if "Strength" in session_type:
            return self._build_strength_session(plan, date, day_name, session_type)
        elif "Endurance" in session_type:
            return self._build_endurance_session(plan, date, day_name, session_type)
        else:
            return self._create_rest_day(plan, date, day_name)

   
    def _build_strength_session(self, plan, date, day_name, session_type):
        
        raw_duration = 60 * self.scale_factor
        duration = int(max(30, min(raw_duration, 90)))
        
        
        duration = 5 * round(duration / 5)

        category = session_type.split("_")[1] 
        
        if self.cycle_week == 1: phase_suffix = "Base"
        elif self.cycle_week == 2: phase_suffix = "Progression"
        elif self.cycle_week == 3: phase_suffix = "Peak Heavy"
        else: phase_suffix = "Deload"

        title = f"{category} ({phase_suffix})"
        
        return DailyWorkout(
            day_of_week=day_name,
            date=date,
            time_of_day=self.profile.training_time_pref,
            workout_type="Strength",
            modality="Gym",
            title=title,
            structure_json=[], 
            estimated_duration_min=duration,
            is_rest_day=False
        )

   
    def _build_endurance_session(self, plan, date, day_name, session_type):
        modality = self.profile.primary_endurance 
        
        if "Intervals" in session_type:
          
            duration = int(60 * self.scale_factor)
            title = f"{modality} Intervals"
        elif "Long" in session_type:
            
            base_week_duration = 90
            if self.cycle_week == 2: base_week_duration = 100
            elif self.cycle_week == 3: base_week_duration = 120
            elif self.cycle_week == 4: base_week_duration = 60
            
           
            duration = int(base_week_duration * self.scale_factor)
            title = f"Long {modality}"
        else: 
            
            duration = int(45 * self.scale_factor)
            title = f"Recovery {modality}"

        duration = 5 * round(duration / 5)

        return DailyWorkout(
            day_of_week=day_name,
            date=date,
            time_of_day="AM",
            workout_type="Endurance",
            modality=modality,
            title=title,
            structure_json=[],
            estimated_duration_min=duration,
            is_rest_day=False
        )

    def _create_rest_day(self, plan, date, day_name):
        return DailyWorkout(
            day_of_week=day_name,
            date=date,
            workout_type="Rest",
            title="Rest Day",
            estimated_duration_min=0,
            is_rest_day=True,
            structure_json=[]
        )