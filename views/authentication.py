from flask import (
    request, make_response, render_template, redirect
)
from models import User
import flask_jwt_extended

def logout():
    # hint:  https://dev.to/totally_chase/python-using-jwt-in-cookies-with-a-flask-app-and-restful-api-2p75

    if request.method == 'GET':
        print("The user is loging out")
        response = make_response(redirect('/login', 302))
        flask_jwt_extended.unset_jwt_cookies(response)
        return response
    else:
        return render_template(
            'login.html'
        )


def login():
    if request.method == 'POST':
        print(request.form)
        username = request.form.get('username')
        password = request.form.get('password')

        if not username:
            return render_template(
                'login.html',
                message="Missing username"
            )
        if not password:
            return render_template(
                'login.html',
                message="Missing password"
            )

        # proceed with database check...
        user = User.query.filter_by(username=username).one_or_none()
        print(user)

        if user: # if valid username, we are gonna check for password
            if user.check_password(password):
                print("The user is authenticated!")

                # Set the JWT cookies in the response header before returning it to the user.
                # Encoding the user's ID in the JWT
                access_token = flask_jwt_extended.create_access_token(identity=user.id)  
                response = make_response(redirect('/'))
                flask_jwt_extended.set_access_cookies(response, access_token)
                return response

            else:
                return render_template(
                'login.html',
                message="Your password is incorrect"
            )

        else:
            return render_template(
                'login.html', 
                message='Invalid username (not in database)'
            )
    else:
        return render_template(
            'login.html'
        )

def initialize_routes(app):
    app.add_url_rule('/login', 
        view_func=login, methods=['GET', 'POST'])
    app.add_url_rule('/logout', view_func=logout)