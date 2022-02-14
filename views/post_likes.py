from flask import Response
from flask_restful import Resource
from models import LikePost, db
import json
from . import can_view_post
from my_decorators import check_ownership_of_like, handle_db_insert_error, like_id_is_valid_int, \
    like_access, like_id_is_valid_int_delete

class PostLikesListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    

    @like_id_is_valid_int
    @like_access
    @handle_db_insert_error
    def post(self, post_id):

        post_like = LikePost(self.current_user.id, post_id)
        db.session.add(post_like)
        db.session.commit()
        
        return Response(json.dumps(post_like.to_dict()), mimetype="application/json", status=201)

class PostLikesDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @like_id_is_valid_int_delete
    @check_ownership_of_like
    def delete(self, post_id, id):
        LikePost.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message' : 'Likepost id={0} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)



def initialize_routes(api):
    api.add_resource(
        PostLikesListEndpoint, 
        '/api/posts/<post_id>/likes', 
        '/api/posts/<post_id>/likes/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )

    api.add_resource(
        PostLikesDetailEndpoint, 
        '/api/posts/<post_id>/likes/<id>', 
        '/api/posts/<post_id>/likes/<id>/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
