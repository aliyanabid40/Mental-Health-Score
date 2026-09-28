# Mental Health Score Prediction System

This university project uses supervised machine learning to predict a student's **Mental Health Score** (0–10) based on lifestyle, academic, and digital habits. The web application loads a pre-trained scikit-learn model and serves predictions through a FastAPI backend with a modern frontend.

**Live Demo:** [https://mental-health-score-kappa.vercel.app](https://mental-health-score-kappa.vercel.app)

---

## Dataset and Features

The model is trained on the **Student Social Media And Mental Health Impact** dataset.

**Input Features used:**
- Age
- Gender
- Country
- Academic Level
- Most Used Platform
- Purpose of Use
- Average Daily Usage Hours
- Daily Unlocks
- Study Hours
- Physical Activity Hours
- Sleep Hours Per Night
- Stress Level

The target variable is the **Mental Health Score** (continuous value scaled between 0–10).

---

## Algorithms and Model

- Model used: Pre-trained scikit-learn model (saved as `Mental_Health_Model.pkl`)
- The application loads the saved model at runtime and does **not** retrain when the server starts.
- Features are preprocessed (including country grouping for rare values) before prediction.

---

## Project Structure

```text
Mental-Health-Score/
├── main.py                              # FastAPI application
├── requirements.txt
├── README.md
├── Mental_Health_Model.pkl              # Trained model
├── Mental_Health_ML_Project.ipynb       # Training notebook
├── Student Social Media And Mental Health Impact.csv
├── index.html                           # Frontend
├── style.css
└── script.js
```

---

## Installation & Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/aliyanabid40/Mental-Health-Score.git
cd Mental-Health-Score

# 2. Create virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the application
uvicorn main:app --reload
```

Open your browser and go to:  
`http://127.0.0.1:8000`

---

## How to Use

1. Fill in the form with your age, gender, country, academic level, digital habits, study hours, physical activity, sleep, and stress level.
2. Click **“Read my signal”**.
3. The model returns a predicted **Mental Health Score** between 0 and 10 along with a short interpretation (strong / steady / mixed / strained).

---

## API Endpoint

**POST** `/predict`

**Request Body Example:**
```json
{
  "age": 21,
  "gender": "Male",
  "country": "Pakistan",
  "academic_level": "Undergraduate",
  "most_used_platform": "Instagram",
  "purpose_of_use": "Entertainment",
  "avg_daily_usage_hours": 4.5,
  "daily_unlocks": 80,
  "study_hours": 5.0,
  "physical_activity_hours": 1.0,
  "sleep_hours_per_night": 6.5,
  "stress_level": "Medium"
}
```

**Response:**
```json
{
  "predicted_mental_health_score": 6.42
}
```

---

## Privacy & Limitations

- This is a **demo / educational project**.
- Predictions are based on patterns learned from the training data and should **not** be treated as a medical diagnosis.
- No personal data is stored or logged by the application.
- The model is loaded from a local trusted file (`Mental_Health_Model.pkl`).

---

## Technologies Used

- **Backend:** FastAPI + Pydantic
- **ML:** scikit-learn, pandas, joblib
- **Frontend:** HTML, CSS, JavaScript
- **Deployment:** Vercel

---

## Author

**Aliyan Abid**  
AI & Machine Learning Student  
[GitHub](https://github.com/aliyanabid40) | [LinkedIn](https://www.linkedin.com/in/aliyan-abid-457080369)
