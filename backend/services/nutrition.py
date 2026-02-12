import datetime
from models import UserProfile, DailyWorkout, User

class NutritionCalculator:
    """
    Physiological engine that calculates macros based on the specific 
    demands of a DailyWorkout object AND the user's Goal.
    """
    
    def __init__(self, user_profile: UserProfile, user: User):
        self.profile = user_profile
        self.user = user
        self.age = self._calculate_age(user.birthdate)
        
        
        
        
        
        
        self.bmr = (10 * self.profile.bodyweight) + (6.25 * self.profile.height) - (5 * self.age) + 5

    def _calculate_age(self, birthdate):
        today = datetime.date.today()
        return today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))

    def calculate_daily_needs(self, workout: DailyWorkout):
        """
        Main logic function. Takes a specific DailyWorkout row from your DB
        and returns the fueling strategy for that specific day.
        """
        
        
        
        
        tdee_base = self.bmr * 1.2 

        
        duration_hours = workout.estimated_duration_min / 60.0
        active_calories = 0
        intensity_label = "Rest"

        if workout.is_rest_day:
            active_calories = 0
            intensity_label = "Recovery"
        
        elif workout.workout_type == "Strength":
            
            active_calories = 6.0 * self.profile.bodyweight * duration_hours
            intensity_label = "Strength/Hypertrophy"

        elif workout.workout_type == "Endurance":
            title_lower = workout.title.lower()
            
            if "interval" in title_lower or "vo2" in title_lower or "threshold" in title_lower:
                
                active_calories = 11.0 * self.profile.bodyweight * duration_hours
                intensity_label = "High Intensity Interval"
            elif "long" in title_lower or "zone 2" in title_lower:
                
                active_calories = 8.0 * self.profile.bodyweight * duration_hours
                intensity_label = "Endurance Base"
            else:
                
                active_calories = 5.0 * self.profile.bodyweight * duration_hours
                intensity_label = "Active Recovery"

        
        maintenance_calories = tdee_base + active_calories

        
        
        goal_adjustment = 0
        user_goal = (self.profile.goal or "maintain").lower()

        
        
        
        
        if "lose" in user_goal or "fat" in user_goal or "cut" in user_goal:
            goal_adjustment = -500
        elif "build" in user_goal or "muscle" in user_goal or "bulk" in user_goal or "gain" in user_goal:
            goal_adjustment = 300
        
        total_daily_calories = int(maintenance_calories + goal_adjustment)

        
        if total_daily_calories < self.bmr:
            total_daily_calories = int(self.bmr)

        
        
        
        
        protein_g = int(self.profile.bodyweight * 2.0)
        protein_cals = protein_g * 4

        
        fat_g = int(self.profile.bodyweight * 0.9)
        fat_cals = fat_g * 9

        
        
        
        remainder_cals = total_daily_calories - (protein_cals + fat_cals)
        carb_g = int(remainder_cals / 4)

        
        if carb_g < 120: 
            carb_g = 120
            
            total_daily_calories = protein_cals + fat_cals + (carb_g * 4)

        
        timing_schedule = self._generate_timing(workout, carb_g, protein_g)

        return {
            "day_context": {
                "date": workout.date,
                "type": intensity_label,
                "duration": workout.estimated_duration_min
            },
            "targets": {
                "calories": total_daily_calories,
                "protein": protein_g,
                "carbs": carb_g,
                "fats": fat_g,
                "hydration_liters": round(0.035 * self.profile.bodyweight + (duration_hours * 0.6), 1)
            },
            "timing": timing_schedule
        }

    def _generate_timing(self, workout: DailyWorkout, total_carbs, total_protein):
        """Generates advice based on AM/PM training and duration."""
        schedule = []
        
        if workout.is_rest_day:
            return [{"window": "All Day", "advice": "Spread meals evenly. Focus on protein quality and hydration."}]

        
        if workout.time_of_day == "AM":
            schedule.append({
                "window": "Pre-Workout (AM)", 
                "advice": "Fast digesting carbs + whey (e.g., Banana + Shake). Avoid heavy fats."
            })
        else:
            schedule.append({
                "window": "Pre-Workout (60m prior)", 
                "advice": "Balanced meal: Chicken/Rice or Oats. ~40g Carbs."
            })

        
        if workout.estimated_duration_min >= 75:
             schedule.append({
                "window": "Intra-Workout", 
                "advice": "Liquid Carbs + Electrolytes. Target 30-60g carbs per hour."
            })
        elif workout.workout_type == "Strength":
             schedule.append({
                "window": "Intra-Workout", 
                "advice": "Water + Electrolytes. Optional: Essential Amino Acids (EAAs)."
            })

        
        schedule.append({
            "window": "Post-Workout (Immediate)", 
            "advice": "Recovery Window: High Glycemic Carbs + Protein (2:1 Ratio)."
        })

        return schedule