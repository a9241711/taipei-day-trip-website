from distutils.log import debug
from flask import *
from api.attraction import api_attraction


app = Flask(__name__, static_folder="./static")
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.register_blueprint(api_attraction, url_prefix="/api")

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
    app.run(host='0.0.0.0', port=3000,debug=True)
