from flask import Response, request
from flask_restful import Resource
from models import Following, User, db
import json
from my_decorators import handle_db_insert_error, user_id_is_valid_int, following_access, \
    id_is_valid_int_delete, check_ownership_of_following
import flask_jwt_extended

def get_path():
    return request.host_url + 'api/posts/'

class FollowingListEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def get(self):
        following_ppl = Following.query.filter_by(user_id = self.current_user.id).all()
        following_list_of_dicts = [
            follower.to_dict_following() for follower in following_ppl
        ]
        return Response(json.dumps(following_list_of_dicts), mimetype="application/json", status=200)
    
    @flask_jwt_extended.jwt_required()
    @user_id_is_valid_int
    @following_access
    @handle_db_insert_error
    def post(self):
        
        body = request.get_json()
        following_id = body.get('user_id')
        
        following = Following(self.current_user.id, following_id)

        db.session.add(following)
        db.session.commit()

        return Response(json.dumps(following.to_dict_following()), mimetype="application/json", status=201)


class FollowingDetailEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    @id_is_valid_int_delete
    @check_ownership_of_following
    def delete(self, id):
        Following.query.filter_by(id=id).delete()
        db.session.commit()
        
        serialized_data = {
            'message' : 'Following Status {0} successfully removed.'.format(id)
        }

        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        FollowingListEndpoint, 
        '/api/following', 
        '/api/following/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
    api.add_resource(
        FollowingDetailEndpoint, 
        '/api/following/<id>', 
        '/api/following/<id>/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
