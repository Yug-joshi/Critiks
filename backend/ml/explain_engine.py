from transformers import pipeline

class AIReportEngine:
    def __init__(self):
        try:
            self.generator = pipeline('text-generation', model='distilgpt2')
        except Exception as e:
            print(f"Error loading model: {e}")
            self.generator = None

    def generate_report(self, portfolio_stats: dict):
        prompt = (
            f"Financial Executive Summary Analysis:\n"
            f"- Total loans processed: {portfolio_stats['total']}\n"
            f"- High-risk accounts identified: {portfolio_stats['high_risk']}\n"
            f"- Fraud alerts triggered: {portfolio_stats['fraud']}\n\n"
            f"Based on these metrics, our strategic recommendation is to "
        )

        if not self.generator:
            return (
                f"Financial Executive Summary:\n"
                f"Total loans: {portfolio_stats['total']}\n"
                f"High-risk accounts: {portfolio_stats['high_risk']}\n"
                f"Fraud alerts: {portfolio_stats['fraud']}\n\n"
                f"Based on the analysis, we recommend an immediate review of the "
                f"{portfolio_stats['high_risk']} high-risk accounts and "
                f"{portfolio_stats['fraud']} fraud alerts to mitigate potential losses. "
                f"The majority of the {portfolio_stats['total']} loans are performing well."
            )

        # Commented out AI recommendation generation as requested
        '''
        try:
            # Generate text with repetition penalties to prevent looping
            result = self.generator(
                prompt, 
                max_new_tokens=80, 
                do_sample=True, 
                temperature=0.7,
                repetition_penalty=1.2,
                no_repeat_ngram_size=2,
                pad_token_id=50256
            )
            
            generated_text = result[0]['generated_text']
            
            # Remove the prompt from the generated text if it exists
            if generated_text.startswith(prompt):
                generated_text = generated_text[len(prompt):].strip()
                
            formatted_report = (
                f"Financial Executive Summary\n"
                f"---------------------------\n"
                f"Total loans: {portfolio_stats['total']:,}\n"
                f"High-risk accounts: {portfolio_stats['high_risk']:,}\n"
                f"Fraud alerts: {portfolio_stats['fraud']:,}\n\n"
                f"AI Strategic Recommendation:\n"
                f"{generated_text}"
            )
            return formatted_report
        except Exception as e:
            return f"Failed to generate report: {str(e)}"
        '''
        
        # Only returning the summary for now
        formatted_report = (
            f"Financial Executive Summary\n"
            f"---------------------------\n"
            f"Total loans: {portfolio_stats['total']:,}\n"
            f"High-risk accounts: {portfolio_stats['high_risk']:,}\n"
            f"Fraud alerts: {portfolio_stats['fraud']:,}\n"
        )
        return formatted_report

report_engine = AIReportEngine()
