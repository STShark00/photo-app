from dotenv import load_dotenv
load_dotenv()
from flask import Flask, request
from flask_restful import Api
from flask_cors import CORS
from flask import render_template
import os
from models import db, User, ApiNavigator
from views import bookmarks, comments, followers, following, \
    posts, profile, stories, suggestions, post_likes

import flask_jwt_extended


app = Flask(__name__)


# New thing we have to do is initialize the jwt convenience library
# jwt convenience library
app.config["JWT_SECRET_KEY"] = os.environ.get('JWT_SECRET')  # Change this "super secret" with something else!
app.config["JWT_TOKEN_LOCATION"] = ["headers", "cookies", "json", "query_string"]
app.config["JWT_COOKIE_SECURE"] = False
jwt = flask_jwt_extended.JWTManager(app)


# CORS: allows anyone from anywhere to use your API:
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DB_URL')
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False    


db.init_app(app)
api = Api(app)

# set logged in user
with app.app_context():
    app.current_user = User.query.filter_by(id=12).one()


# Initialize routes for all of your API endpoints:
bookmarks.initialize_routes(api)
comments.initialize_routes(api)
followers.initialize_routes(api)
following.initialize_routes(api)
posts.initialize_routes(api)
post_likes.initialize_routes(api)
profile.initialize_routes(api)
stories.initialize_routes(api)
suggestions.initialize_routes(api)


# Server-side template for the homepage:
@app.route('/')
def home():
    return render_template(
        'starter-client.html', 
        user=app.current_user
    )

@app.route('/api')
def api_docs():
    navigator = ApiNavigator(app.current_user)
    return render_template(
        'api/api-docs.html', 
        user=app.current_user,
        endpoints=navigator.get_endpoints(),
        url_root=request.url_root[0:-1] # trim trailing slash
    )

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        print(request.form)
        username = request.form.get('username')
        password = request.form.get('password')
        #check database:
        results = User.query.filter_by(username = username).all()
        if len(results) == 1:
            user = results[0]
            print(user)
            print('Set token')
        else:
            return 'INVALID'


        print("handle authentication and token setting")
    return render_template('login.html')


# enables flask app to run using "python3 app.py"
if __name__ == '__main__':
    app.run()
