from flask import *
from api.attraction import api_attraction
from api.user import api_user
from api.booking import api_booking
from api.order import api_order
import os
from flask_jwt_extended import JWTManager

app = Flask(__name__, static_folder="static")

jwt = JWTManager(app)
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True


app.register_blueprint(api_attraction, url_prefix="/api")
app.register_blueprint(api_user, url_prefix="/api")
app.register_blueprint(api_booking, url_prefix="/api")
app.register_blueprint(api_order,url_prefix="/api")
app.secret_key =os.getenv("SESSIONKEY")   # session的密鑰
app.config["JWT_SECRET_KEY"] = "super-secret"  # Change this!
jwt.init_app(app)
# app.config["PERMANENT_SESSION_LIFETIME"] = 600  # Session過期時間
# Pages


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/attraction/<id>")
def attraction(id):
    return render_template("attraction.html")


@app.route("/booking")
def booking():
    return render_template("booking.html")


@app.route("/thankyou")
def thankyou():
    return render_template("thankyou.html")


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3000, debug=True)
