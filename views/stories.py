from flask import Response
from flask_restful import Resource
from models import Story
from . import get_authorized_user_ids
import json
import flask_jwt_extended

class StoriesListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def get(self):
        allowed_user_ids = get_authorized_user_ids(self.current_user)
        visible_stories = Story.query.filter(Story.user_id.in_(allowed_user_ids))
        stories_list_of_dicts = [
            story.to_dict() for story in visible_stories
        ]
        return Response(json.dumps(stories_list_of_dicts), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        StoriesListEndpoint, 
        '/api/stories', 
        '/api/stories/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
