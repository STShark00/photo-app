const html2Element = html => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.firstElementChild;
};





const story2Html = story => {
    return `
        <div>
            <img src="${ story.user.thumb_url }" class="pic" alt="profile pic for ${ story.user.username }" />
            <p>${ story.user.username }</p>
        </div>
    `;
};

// fetch data from your API endpoint:
const displayStories = () => {
    fetch('/api/stories')
        .then(response => response.json())
        .then(stories => {
            const html = stories.map(story2Html).join('\n');
            document.querySelector('.stories').innerHTML = html;
        })
};





// 1. Get the post data from the API endpoint (/api/posts?limit=10)
// 2. When the data arrives, we're going to build a bunch of HTML cards.
// 3. Update the container and put the html inside of it.

const redrawPost = (postId, callback) => {
    fetch(`/api/posts/${ postId }`)
        .then(response => response.json())
        .then(data => {
            const html = post2Html(data)
            const new_post = html2Element(html)

            document.querySelector(`#card-${ postId }`).innerHTML = new_post.innerHTML

            if (callback) {
                callback();
            }
        });
}



const toggleLike = ev => {
    const elem = ev.currentTarget;

    if (elem.getAttribute('aria-checked') === 'false') {
        likePost(elem.dataset.postId, elem);
    } else {
        unlikePost(elem.dataset.postId, elem.dataset.likeId, elem);
    }
};

const likePost = (postId, elem) => {
    
    const postData = {};

    const likeURL = `/api/posts/${ postId }/likes/`;

    fetch(likeURL, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        },
        body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        
        redrawPost(postId);

        // in the event that we want to unfollow
        // elem.setAttribute('data-like-id', data.id);
        // elem.setAttribute('aria-checked', 'true');
    });

    
};

const unlikePost = (postId, likeId, elem) => {
    //issue a delete request:
    const unlikeURL = `/api/posts/${ postId }/likes/${ likeId }`;

    fetch(unlikeURL, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        redrawPost(postId);

        // elem.removeAttribute('data-like-id');
        // elem.setAttribute('aria-checked', 'false');
    });
    
};

const toggleBookmark = ev => {
    const elem = ev.currentTarget;

    if (elem.getAttribute('aria-checked') === 'false') {
        bookmarkPost(elem.dataset.postId, elem);
    } else {
        unbookmarkPost(elem.dataset.postId, elem.dataset.bookmarkId, elem);
    }

};

const bookmarkPost = (postId, elem) => {
    
    const postData = {
        "post_id": postId
    };
    
    fetch("/api/bookmarks/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            },
            body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        elem.innerHTML = `<i class="fas fa-bookmark"></i>`;
    
        // in the event that we want to unfollow
        elem.setAttribute('data-bookmark-id', data.id);
        elem.setAttribute('aria-checked', 'true');
    });
    
};

const unbookmarkPost = (postId, bookmarkId, elem) => {
    
    const unbookmarkURL = `/api/bookmarks/${ bookmarkId }`

    fetch(unbookmarkURL, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        elem.innerHTML = `<i class="far fa-bookmark"></i>`;

        elem.removeAttribute('data-bookmark-id');
        elem.setAttribute('aria-checked', 'false');
    });
    
};


const displayModalComments = comments => {
    let html = ``;
    for (let comment of comments) {
        html += `
            <div class="modal-comment">
                <img src="${ comment.user.thumb_url }" alt="Profile pic for ${ comment.user.username }" />
                <p class="modal-comment-text">
                    <strong> ${ comment.user.username } </strong>
                    ${ comment.text }
                </p>
            </div>
            <p class="timestamp"> ${ comment.display_time } </p>
        `;
    }
    return html;
};



const destroyModal = ev => {
    document.querySelector('#modal-container').innerHTML = "";
    document.getElementById("viewAllComments-${ postID }").focus();
};

const showPostDetail = ev => {
    const postId = ev.currentTarget.dataset.postId;
    fetch(`/api/posts/${ postId }`)
        .then (response => response.json())
        .then (post => {
            const html = `
                <div class="modal-bg">
                    <button onclick="destroyModal(event)" id="exitModal">
                        <i class="fas fa-times"></i>
                    </button>>
                    <div class="modal">
                        <img src="${ post.image_url }"/>
                        <div class="post-info">
                            <div class="user-info">
                                <div class="profile_image">
                                    <img src="${ post.user.thumb_url }" class="pic" alt="${ post.user.username }'s profile picture"/>
                                </div>              
                                <h1 style="font-size:30px;text-align:center">${ post.user.username }</h1>
                            </div>
                            <div class="modal-comments">
                                ${ displayModalComments(post.comments) }
                            </div>
                        </div>
                    </div>
                </div>`;
            document.querySelector('#modal-container').innerHTML = html;

            document.getElementById("exitModal").focus();
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape') {
                    destroyModal(postId);
                }
        })
    });
    
};
//${ displayAllComments(post.comments, post.id) }


const postComment = ev => {
    const elem = ev.currentTarget;
    const postId = elem.dataset.postId;
    const comment = document.querySelector(`#comment_for_${ postId }`).value;

    const postData = {
        "post_id": postId,
        "text": comment
    };
    
    fetch("/api/comments", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            redrawPost(postId, () => {document.querySelector(`#comment_for_${ postId }`).focus();} );         
        });

};


const displayComments = (comments, postID) => {
    let html = '';
    if (comments.length > 1) {
        html += `
            <button class="link" id="viewAllComments-${ postID }" data-post-id="${ postID }"onclick="showPostDetail(event)">
                view all ${ comments.length } comments
            </button>
        `;
    }
    if (comments && comments.length > 0) {
        const lastComment = comments[comments.length - 1];
        html += `
            <p>
                <strong> ${ lastComment.user.username } </strong>
                ${ lastComment.text }
            </p>
            <div class="timestamp">${ lastComment.display_time }</div>
        `;
    }

    html += `
        <div class="add-comment">
            <div class="input-holder">
                <input id="comment_for_${ postID }" type="text" aria-label="Add a comment" placeholder="Add a comment...">
            </div>
            <button class="link"
                id="postComment"
                data-post-id="${ postID }"
                onclick="postComment(event)">
                Post
            </button>
        </div>
    `;

    return html;
}


const post2Html = post => { 
    return `
    <section class="card" id="card-${ post.id }">
        <div class="header">
            <h3>${ post.user.username }</h3>
            <i class="fa fa-dots"></i>
        </div>
        <img src="${ post.image_url }" alt="Image posted by ${ post.user.username }" width="300" height="300">
        <div class="info">
            <div class="buttons">
                <div>
                    <button class="like"
                        aria-label="Like"
                        aria-checked="${ post.current_user_like_id ? 'true' : 'false'}"
                        data-post-id="${ post.id }"
                        data-like-id="${ post.current_user_like_id }"
                        onclick="toggleLike(event)">
                        <i class="fa${ post.current_user_like_id ? 's' : 'r'} fa-heart"></i>
                    </button>
                    <button data-post-id="${ post.id }" onclick="showPostDetail(event)">
                        <i class="far fa-comment"></i>
                    </button>
                    <button onclick="shareScreen(event)">
                        <i class="far fa-paper-plane"></i>
                    </button>
                </div>
                <div>
                    <button class="bookmark"
                        aria-label="Bookmark"
                        aria-checked="${ post.current_user_bookmark_id ? 'true' : 'false'}"
                        data-post-id="${ post.id }"
                        data-bookmark-id="${ post.current_user_bookmark_id }"
                        onclick="toggleBookmark(event)">
                        <i class="fa${ post.current_user_bookmark_id ? 's' : 'r'} fa-bookmark"></i>
                    </button>
                </div>
            </div>
            <p class="likes"><strong>${ post.likes.length } like${ post.likes.length !== 1 ? 's' : ''}</strong></p>
            <div class="caption">
                <p>
                    <strong>${ post.user.username }</strong> 
                    ${ post.caption }
                </p>
            </div>
            <div class="comments">
                ${ displayComments(post.comments, post.id) }
            </div>

        </div>
    </section>
    `;
};

// fetch data from your API endpoint:
const displayPosts = () => {
    fetch('/api/posts')
        .then(response => response.json())
        .then(posts => {
            const html = posts.map(post2Html).join('\n');
            document.querySelector('#posts').innerHTML = html;
        })
};


const getUserProfile = () => {
    fetch('/api/profile')
        .then(response => response.json())
        .then(user => {
        
            const html = `
                <div class="profile_image">
                    <img src="${ user.thumb_url }" class="pic" alt="${ user.username }'s profile picture"/>
                </div>              
                <h1 style="font-size:30px;text-align:center">${ user.username }</h1>
            `;
            document.querySelector('#user-profile').innerHTML = html;
    });

};







const toggleFollow = ev => {
    console.log(ev);
    const elem = ev.currentTarget;
    console.log(elem.dataset);
    console.log(elem.dataset.userId);
    console.log(elem.innerHTML);
    if (elem.getAttribute('aria-checked') === 'false') {
        followUser(elem.dataset.userId, elem);
    } else {
        unfollowUser(elem.dataset.followingId, elem);
    }
}

const followUser = (userId, elem) => {
    const postData = {
        "user_id": userId
    }
    
    fetch("/api/following", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        },
        body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        elem.innerHTML = 'unfollow';

        elem.classList.add('unfollow');
        elem.classList.remove('follow');

        // in the event that we want to unfollow
        elem.setAttribute('data-following-id', data.id);
        elem.setAttribute('aria-checked', 'true');
    });
};

const unfollowUser = (followingId, elem) => {
    //issue a delete request:
    const deleteURL = `/api/following/${followingId}`;

    fetch(deleteURL, {
            method: "DELETE",
            headers: {
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.innerHTML = 'follow';

            elem.classList.add('follow');
            elem.classList.remove('unfollow');

            elem.removeAttribute('data-following-id');
            elem.setAttribute('aria-checked', 'false');
    });
};




const user2Html = user => {
    return `
    <div class="suggestion">
        <img src="${ user.thumb_url }" class="pic" alt="Profile pic for ${ user.username }" />
        <div>
            <p class="username">${ user.username }</p>
            <p class="suggestion-text">suggested for you</p>
        </div>
        <div>
            <button
                class="link follow"
                aria-label="Follow"
                aria-checked="false"
                data-user-id="${ user.id }"
                onclick="toggleFollow(event)">follow</button>
        </div>
    </div>`;

};


const getSuggestions = () => {
    fetch('/api/suggestions')
        .then(response => response.json())
        .then(users => {
            console.log(users);
            const html = `<p>Suggestions for you</p>`;
            const userhtml = users.map(user2Html).join('\n');
            document.querySelector('.suggestions').innerHTML = html + userhtml;
    });

};









const initPage = () => {
    displayStories();
    displayPosts();
    getUserProfile();
    getSuggestions();
};

// invoke init page to display stories:
initPage();