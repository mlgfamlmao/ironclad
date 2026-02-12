from typing import Dict, Optional, List
from schemas import ProfileCreate


STRENGTH_DURATION = 60
WARMUP_STEPS = [0.50, 0.70, 0.85]  
REST_PERIODS = {
    "compound": 180,  
    "accessory": 90   
}



STRENGTH_LOADING_PROGRESSION = {
    1: {"intensity": 0.65, "sets": 3, "reps": 5},  
    2: {"intensity": 0.70, "sets": 3, "reps": 5},  
    3: {"intensity": 0.75, "sets": 4, "reps": 5},  
    4: {"intensity": 0.80, "sets": 4, "reps": 5},  
}

DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


class TrainingEngine:
    def __init__(self, profile: ProfileCreate, training_week: int = 1):
        self.profile = profile
        self.rest_day = profile.preferred_rest_day
        self.weekly_hours = profile.weekly_hours
        self.total_minutes = self.weekly_hours * 60
        self.training_week = min(max(training_week, 1), 4)  

        
        self.strength_days_used = 0
        self.accumulated_endurance_minutes = 0
        self.accumulated_strength_minutes = 0
        
        
        
        
        endurance_total_minutes = self.total_minutes * 0.80
        strength_total_minutes = self.total_minutes * 0.20
        
        
        
        
        easy_minutes = endurance_total_minutes * 0.80
        hard_minutes = endurance_total_minutes * 0.20
        
        
        
        
        num_hard_sessions = 2  
        interval_duration = 75  
        tempo_duration = 75     
        
        
        long_duration = int(endurance_total_minutes * 0.25)
        
        
        remaining_easy = easy_minutes - long_duration
        
        
        
        if self.weekly_hours > 12:
            num_easy_sessions = 3  
            easy_session_duration = int(remaining_easy / num_easy_sessions)
        elif self.weekly_hours > 10:
            num_easy_sessions = 2
            easy_session_duration = int(remaining_easy / num_easy_sessions)
        else:
            num_easy_sessions = 1
            easy_session_duration = int(remaining_easy / num_easy_sessions)
        
        self.durations = {
            "long": long_duration,           
            "interval": interval_duration,   
            "tempo": tempo_duration,         
            "base": easy_session_duration,   
            "recovery": 45,                  
            "strength": STRENGTH_DURATION,   
        }
        
        
        self.volume_targets = {
            "endurance_minutes": int(endurance_total_minutes),
            "strength_minutes": int(strength_total_minutes),
            "easy_minutes": int(easy_minutes),
            "hard_minutes": int(hard_minutes),
        }

    
    def generate_weekly_plan(self) -> Dict:
        plan = {}
        
        
        
        
        
        
        
        
        
        
        
        rest_idx = DAYS_OF_WEEK.index(self.rest_day)

        for i, day in enumerate(DAYS_OF_WEEK):
            
            day_offset = (i - rest_idx) % 7
            plan[day] = self._generate_day_by_role(day, day_offset)
        
        
        plan["_validation"] = self._validate_plan_volume(plan)
        
        return plan

    
    def _generate_day_by_role(self, day: str, offset: int) -> Dict:
        
        if offset == 0:
            return {"AM": None, "PM": None}

        pref_time = self.profile.training_time_pref.lower()
        
        
        
        
        am_session = None
        pm_session = None

        
        if offset == 1:
            session = self._create_endurance(
                "Long Aerobic Ride", 
                "long", 
                "Zone 2: Aerobic Threshold",
                is_easy=True
            )
            
            if pref_time in ["am", "mixed"]:
                am_session = session
            else:
                pm_session = session

        
        elif offset == 2:
            strength = self._create_strength(focus="Squat")  
            
            
            if self.weekly_hours > 10:
                endurance = self._create_endurance(
                    "Aerobic Base", 
                    "base", 
                    "Zone 2: Endurance",
                    is_easy=True
                )
                
                am_session = endurance
                pm_session = strength
            else:
                
                if pref_time == "am":
                    am_session = strength
                else:
                    pm_session = strength

        
        elif offset == 3:
            session = self._create_endurance(
                "VO2max Intervals", 
                "interval", 
                "Zone 4-5: VO2max",
                is_easy=False
            )
            
            if pref_time == "am":
                am_session = session
            else:
                pm_session = session

        
        elif offset == 4:
            strength = self._create_strength(focus="Deadlift")  
            
            
            if self.weekly_hours > 12:
                endurance = self._create_endurance(
                    "Aerobic Base", 
                    "base", 
                    "Zone 2: Endurance",
                    is_easy=True
                )
                am_session = endurance
                pm_session = strength
            else:
                
                if pref_time == "am":
                    am_session = strength
                else:
                    pm_session = strength

        
        elif offset == 5:
            session = self._create_endurance(
                "Tempo Intervals", 
                "tempo", 
                "Zone 3: Tempo",
                is_easy=False
            )
            if pref_time == "am":
                am_session = session
            else:
                pm_session = session

        
        elif offset == 6:
            session = self._create_endurance(
                "Active Recovery", 
                "recovery", 
                "Zone 1: Recovery",
                is_easy=True
            )
            
            if pref_time == "am":
                am_session = session
            else:
                pm_session = session

        return {"AM": am_session, "PM": pm_session}

    
    def _create_endurance(self, name: str, role_key: str, zone: str, is_easy: bool) -> Dict:
        duration = self.durations.get(role_key, 60)
        
        
        description = "Maintain steady output within prescribed zone."
        workout_structure = None
        
        if role_key == "interval":
            
            description = "Build maximum aerobic capacity with short, intense efforts."
            workout_structure = {
                "warmup": "15 min easy",
                "main_set": "5 x 5min @ Zone 5 (105-120% FTP)",
                "recovery": "3 min easy between intervals",
                "cooldown": "10 min easy"
            }
        elif role_key == "tempo":
            
            description = "Build threshold power with sustained efforts at the upper edge of comfort."
            workout_structure = {
                "warmup": "15 min easy",
                "main_set": "3 x 15min @ Zone 3 (85-95% FTP)",
                "recovery": "5 min easy between efforts",
                "cooldown": "10 min easy"
            }
        elif role_key == "recovery":
            description = "Very light spinning to promote blood flow and recovery. Should feel refreshing, not tiring."
            workout_structure = {
                "effort": "Zone 1 only (<65% FTP)",
                "cadence": "High cadence (90-100 rpm), very low resistance",
                "focus": "Active recovery, not training stress"
            }
        elif role_key == "long":
            description = "Long steady ride for aerobic base development. Practice nutrition and pacing."
            workout_structure = {
                "effort": "Zone 2 steady (65-75% FTP)",
                "nutrition": "Practice race nutrition every 30-45 minutes",
                "focus": "Aerobic endurance, fat oxidation, mental resilience"
            }
        elif role_key == "base":
            description = "Steady aerobic base work to accumulate volume without excess fatigue."
            workout_structure = {
                "effort": "Zone 2 steady (65-75% FTP)",
                "focus": "Conversational pace, aerobic development"
            }
        
        
        if is_easy:
            self.accumulated_endurance_minutes += duration
        
        return {
            "type": "Endurance",
            "name": name,
            "role": role_key,
            "zone": zone,
            "duration_min": duration,
            "description": description,
            "workout_structure": workout_structure,
            "modality": self.profile.primary_endurance,
            "metric_type": self.profile.endurance_metric_type,
            "metric_value": self.profile.endurance_metric_value,
            "is_easy": is_easy,
        }

    def _create_strength(self, focus: str) -> Dict:
        """
        FIXED: Proper A/B split - never squat AND deadlift same day
        """
        lifts = {}
        accessories = []
        
        
        loading = STRENGTH_LOADING_PROGRESSION[self.training_week]
        
        
        if focus == "Squat":
            
            if self.profile.squat_max:
                lifts["Primary"] = self._lift_block(
                    "Back Squat", 
                    self.profile.squat_max, 
                    loading
                )
            
            
            if self.profile.press_max:
                lifts["Secondary"] = self._lift_block(
                    "Overhead Press", 
                    self.profile.press_max, 
                    {**loading, "sets": 3}  
                )
            
            
            accessories = [
                {
                    "name": "Romanian Deadlift",
                    "sets": 3,
                    "reps": 8,
                    "rest_seconds": REST_PERIODS["accessory"],
                    "notes": "Focus on hamstring stretch, 60-70% of deadlift max"
                },
                {
                    "name": "Bulgarian Split Squat",
                    "sets": 3,
                    "reps": "10 each leg",
                    "rest_seconds": REST_PERIODS["accessory"],
                    "notes": "Bodyweight or light dumbbells, balance and single-leg strength"
                }
            ]

        
        elif focus == "Deadlift":
            
            if self.profile.deadlift_max:
                lifts["Primary"] = self._lift_block(
                    "Deadlift", 
                    self.profile.deadlift_max, 
                    {**loading, "sets": 3}  
                )
            
            
            if self.profile.press_max:
                bench_estimate = self.profile.press_max * 1.3  
                lifts["Secondary"] = self._lift_block(
                    "Bench Press", 
                    bench_estimate, 
                    loading
                )
            
            
            accessories = [
                {
                    "name": "Barbell Row",
                    "sets": 3,
                    "reps": 8,
                    "rest_seconds": REST_PERIODS["accessory"],
                    "notes": "70% of deadlift max, focus on upper back thickness"
                },
                {
                    "name": "Face Pulls",
                    "sets": 3,
                    "reps": 15,
                    "rest_seconds": 60,
                    "notes": "Light weight, rear delt and rotator cuff health"
                }
            ]
        
        
        self.accumulated_strength_minutes += STRENGTH_DURATION
        
        return {
            "type": "Strength",
            "name": f"Strength: {focus} Focus",
            "focus": focus,
            "duration_min": STRENGTH_DURATION,
            "training_week": self.training_week,
            "main_lifts": lifts,
            "accessory_work": accessories,
            "notes": f"Week {self.training_week} of 4-week linear progression cycle"
        }

    def _lift_block(self, name: str, one_rm: float, params: Dict) -> Dict:
        """
        FIXED: Better warmup progression relative to working weight.
        Generates a scientifically structured lift block with warmups and working sets.
        """
        working_weight = round(one_rm * params["intensity"], 1)
        working_percentage = params["intensity"]
        
        
        
        warmups = [
            {
                "label": "Bar Only", 
                "weight": 20.0, 
                "reps": 10,
                "note": "Movement prep, joint mobilization"
            },
            {
                "label": "Light Warmup", 
                "weight": round(working_weight * 0.50, 1), 
                "reps": 5,
                "note": "50% of working weight"
            },
            {
                "label": "Heavy Warmup", 
                "weight": round(working_weight * 0.75, 1), 
                "reps": 3,
                "note": "75% of working weight, CNS priming"
            },
        ]

        return {
            "exercise_name": name,
            "one_rep_max": one_rm,
            "warmup_sets": warmups,
            "working_sets": {
                "sets": params["sets"],
                "reps": params["reps"],
                "weight": working_weight,
                "percentage_1rm": f"{int(working_percentage * 100)}%",
                "rest_period": f"{REST_PERIODS['compound']} seconds"
            },
            "progression": self._calculate_progression(name, one_rm, self.training_week)
        }
    
    def _calculate_progression(self, exercise: str, one_rm: float, current_week: int) -> Dict:
        """
        FIXED: Show progression trajectory across 4-week cycle.
        """
        progression = []
        for week in range(1, 5):
            loading = STRENGTH_LOADING_PROGRESSION[week]
            weight = round(one_rm * loading["intensity"], 1)
            progression.append({
                "week": week,
                "weight": weight,
                "sets": loading["sets"],
                "reps": loading["reps"],
                "percentage": f"{int(loading['intensity'] * 100)}%"
            })
        
        return {
            "current_week": current_week,
            "trajectory": progression,
            "note": "After week 4, retest 1RM or increase by 2.5-5kg and restart cycle"
        }
    
    def _validate_plan_volume(self, plan: Dict) -> Dict:
        """
        FIXED: Validation to ensure plan hits volume targets.
        """
        actual_endurance = 0
        actual_strength = 0
        easy_volume = 0
        hard_volume = 0
        
        for day, sessions in plan.items():
            if day == "_validation":
                continue
            
            for slot in ["AM", "PM"]:
                session = sessions.get(slot)
                if session:
                    duration = session.get("duration_min", 0)
                    if session["type"] == "Endurance":
                        actual_endurance += duration
                        if session.get("is_easy"):
                            easy_volume += duration
                        else:
                            hard_volume += duration
                    elif session["type"] == "Strength":
                        actual_strength += duration
        
        targets = self.volume_targets
        
        
        if actual_endurance > 0:
            actual_easy_ratio = easy_volume / actual_endurance
            actual_hard_ratio = hard_volume / actual_endurance
        else:
            actual_easy_ratio = 0
            actual_hard_ratio = 0
        
        return {
            "target_total_hours": self.weekly_hours,
            "actual_total_hours": round((actual_endurance + actual_strength) / 60, 1),
            "target_endurance_min": targets["endurance_minutes"],
            "actual_endurance_min": actual_endurance,
            "target_strength_min": targets["strength_minutes"],
            "actual_strength_min": actual_strength,
            "polarization": {
                "target_easy": "80%",
                "actual_easy": f"{int(actual_easy_ratio * 100)}%",
                "target_hard": "20%",
                "actual_hard": f"{int(actual_hard_ratio * 100)}%"
            },
            "within_tolerance": abs((actual_endurance + actual_strength) - self.total_minutes) < 30,
            "warnings": self._generate_warnings(
                actual_endurance, 
                actual_strength, 
                actual_easy_ratio,
                actual_hard_ratio
            )
        }
    
    def _generate_warnings(
        self, 
        actual_endurance: int, 
        actual_strength: int,
        easy_ratio: float,
        hard_ratio: float
    ) -> List[str]:
        """Generate volume and intensity warnings."""
        warnings = []
        
        targets = self.volume_targets
        total_actual = actual_endurance + actual_strength
        
        
        if total_actual < self.total_minutes * 0.95:
            warnings.append(
                f"Plan is {self.total_minutes - total_actual}min under target. Consider adding easy volume."
            )
        elif total_actual > self.total_minutes * 1.05:
            warnings.append(
                f"Plan is {total_actual - self.total_minutes}min over target. Risk of overtraining."
            )
        
        
        if easy_ratio < 0.75:
            warnings.append(
                f"Too much high-intensity work ({int(hard_ratio*100)}%). Risk of burnout. Target is 80/20."
            )
        
        if hard_ratio < 0.15:
            warnings.append(
                f"Insufficient high-intensity work ({int(hard_ratio*100)}%). May limit performance gains."
            )
        
        return warnings