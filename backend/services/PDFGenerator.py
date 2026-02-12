from fpdf import FPDF
from datetime import date

class PlanPDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'IRONCLAD  TRAINING PROTOCOL', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def generate_weekly_pdf(plan, user_profile):
    pdf = PlanPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, f"Week of: {plan.start_date}", 0, 1, 'L')
    pdf.set_font("Arial", "", 10)
    pdf.cell(0, 5, f"Athlete: {user_profile.user.first_name} {user_profile.user.last_name}", 0, 1, 'L')
    pdf.cell(0, 5, f"Goal: {user_profile.goal}", 0, 1, 'L')
    pdf.ln(10)

  
    sorted_workouts = sorted(plan.workouts, key=lambda x: x.date)

    for workout in sorted_workouts:
        
        pdf.set_fill_color(240, 240, 240)
        pdf.set_font("Arial", "B", 11)
        day_str = workout.date.strftime("%A, %b %d")
        pdf.cell(0, 8, f"{day_str} - {workout.title}", 0, 1, 'L', fill=True)
        
        
        pdf.set_font("Arial", "", 10)
        
        if workout.is_rest_day:
            pdf.ln(2)
            pdf.cell(0, 5, "Focus: Active Recovery", 0, 1)
            pdf.cell(0, 5, "Notes: Sleep 8h+, Hydrate, Mobility work.", 0, 1)
        else:
            pdf.ln(2)
            pdf.cell(0, 5, f"Type: {workout.workout_type}", 0, 1)
            pdf.cell(0, 5, f"Duration: {workout.estimated_duration_min} min", 0, 1)
            
            
            if workout.structure_json:
                pdf.ln(2)
                pdf.set_font("Arial", "B", 9)
                pdf.cell(0, 5, "SESSION STRUCTURE:", 0, 1)
                pdf.set_font("Arial", "", 9)
                
                for step in workout.structure_json:
                    
                    name = step.get('type', 'Effort').capitalize()
                    duration = step.get('duration', '-')
                    if isinstance(duration, int):
                        duration = f"{duration // 60}m"
                    
                    power = f"@ {step.get('power', 0)}w" if step.get('power') else ""
                    
                    pdf.cell(10) 
                    pdf.cell(0, 5, f"- {name}: {duration} {power}", 0, 1)

        pdf.ln(8) 

    return pdf.output(dest='S').encode('latin-1')

def generate_nutrition_pdf(plan, user_profile, nutrition_data):
    pdf = PlanPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, f"NUTRITION PROTOCOL: Week of {plan.start_date}", 0, 1, 'L')
    pdf.set_font("Arial", "", 10)
    pdf.cell(0, 5, f"Athlete: {user_profile.user.first_name} {user_profile.user.last_name}", 0, 1, 'L')
    pdf.cell(0, 5, f"Goal: {user_profile.goal}", 0, 1, 'L')
    pdf.ln(10)

    
    
    for day_data in nutrition_data:
        ctx = day_data['day_context']
        targets = day_data['targets']
        timing = day_data.get('timing', [])

        
        pdf.set_fill_color(240, 240, 240) 
        pdf.set_font("Arial", "B", 11)
        date_str = str(ctx['date'])
        
        header_text = f"{date_str} - {ctx['type']} ({ctx.get('duration',0)} min)"
        pdf.cell(0, 8, header_text, 0, 1, 'L', fill=True)
        
       
        pdf.set_font("Arial", "", 10)
        pdf.ln(2)
        
        
        pdf.cell(40, 6, f"Calories: {targets['calories']}", 0, 0)
        pdf.cell(35, 6, f"Protein: {targets['protein']}g", 0, 0)
        pdf.cell(35, 6, f"Carbs: {targets['carbs']}g", 0, 0)
        pdf.cell(35, 6, f"Fats: {targets['fats']}g", 0, 1)
        pdf.cell(40, 6, f"Water: {targets['hydration_liters']}L", 0, 1)
        
        
        if timing:
            pdf.ln(2)
            pdf.set_font("Arial", "B", 9)
            pdf.cell(0, 5, "TIMING STRATEGY:", 0, 1)
            pdf.set_font("Arial", "", 9)
            
            for slot in timing:
                window = slot.get('window', 'Meal')
                advice = slot.get('advice', '')
                
                pdf.cell(5) 
                pdf.cell(40, 5, f"[{window}]", 0, 0)
                
                pdf.multi_cell(0, 5, advice) 
        
        pdf.ln(6) 

    return pdf.output(dest='S').encode('latin-1')