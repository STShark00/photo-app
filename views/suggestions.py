from flask import Response, request
from flask_restful import Resource
from models import User
from . import get_authorized_user_ids
import json
import flask_jwt_extended


class SuggestionsListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def get(self):
        allowed_user_ids = get_authorized_user_ids(self.current_user)
        
        #Limit may change later
        suggestions = User.query.filter(User.id.notin_(allowed_user_ids)).limit(7)
        suggestions_list_of_dicts = [
            user.to_dict() for user in suggestions
        ]
        return Response(json.dumps(suggestions_list_of_dicts), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        SuggestionsListEndpoint, 
        '/api/suggestions', 
        '/api/suggestions/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
