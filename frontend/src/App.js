
import React, { useState, useEffect } from 'react'
import './App.css';
import Post from './components/post/Post';
import { auth, db } from "./firebase/firebase"
import { Button, Input, Modal } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles'
import ImageUpload from './components/ImageUpload/ImageUpload'
import axios from 'axios'
import Pusher from 'pusher-js'
// import InstagramEmbed from 'react-instagram-embed'



function getModalStyle() {
  const top = 50;
  const left = 50;
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  }
}))

function App() {
  const classes = useStyles()
  const [ modalStyle ] = useState(getModalStyle)
  const [ posts, setPosts ] = useState([])
  const [ open, setOpen ] = useState(false)
  const [ openSignIn, setOpenSignIn ] = useState('')
  const [ username, setUsername ] = useState('')
  const [ password, setPassword ] = useState('')
  const [ email, setEmail ] = useState('')
  const [ user, setUser ] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // User has logged in
        setUser(authUser)
      } else {
        // User has logged out
        setUser(null)
      }
    })
    return () => {
      // Cleanup 
      unsubscribe()
    }
  }, [user, username])

  const fetchPosts = async () =>
    await axios.get("sync").then((response) => {
      console.log(response)
      setPosts(response.data)
    })

  useEffect(() => {
    const pusher = new Pusher('cd29fe0511d430ef3198', {
      cluster: 'us3'
    });

    const channel = pusher.subscribe('posts');
    channel.bind('inserted', function(data) {
      console.log("data receieved" , data)
      fetchPosts()
    });
  })

  useEffect(() => {
    fetchPosts()
  }, []);

  useEffect(() => {
    db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
      // Every time a post is added, this code runs
      setPosts(snapshot.docs.map(doc => ({ 
        id: doc.id,
        post: doc.data() 
      })))
    })
  }, []);
  
  const signUp = (event) => {
    event.preventDefault()

    auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        return authUser.user.updateProfile({
          displayName: username,
      })
    })
    .catch((error) => alert(error.message))

    setOpen(false)
  }

  const signIn = (event) => {
    event.preventDefault()

    auth
      .signInWithEmailAndPassword(email, password)
      .catch((error) => alert(error.message))

    setOpenSignIn(false)
  }

  return (
    <div className="app">
      <Modal
        open={open}
        onClose={() => setOpen(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signup">
            <center>
              <img 
                className="app__headerImage"
                src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                alt=""
              />
            </center>
            <Input type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input 
              placeholder="Email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" onClick={signUp}>Sign Up</Button>
          </form>
        </div>
      </Modal>

      <Modal
        open={openSignIn}
        onClose={() => setOpenSignIn(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signup">
            <center>
              <img 
                className="app__headerImage"
                src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                alt=""
              />
            </center>
            <Input 
              placeholder="Email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" onClick={signIn}>Sign In</Button>
          </form>
        </div>
      </Modal>

      <div className="app__header">
        <img 
          className="app__headerImage"
          src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
          alt=""
        />
        
        {user ? (
          <Button onClick={() => auth.signOut()}>Logout</Button>
        ): (
        <div className="app__loginContainer">
          <Button onClick={() => setOpenSignIn(true)}>Sign In</Button>
          <Button onClick={() => setOpen(true)}>Sign Up</Button>
        </div>
      )}
      </div>
      
      
        <div className="app__posts">
          <div className="app__postsLeft">
            {
              posts.map((post) => (
                <Post 
                  key={post._id}
                  postId={post._id}
                  user={user}
                  username={post.username} 
                  caption={post.caption}
                  imageUrl={post.image}
                />
              ))
            }
          </div>
          <div className="app__postsRight">
            {/* 
              <InstagramEmbed
                url='https://instagr.am/p/Zw9o4/'
                clientAccessToken='123|456'
                maxWidth={320}
                hideCaption={false}
                containerTagName='div'
                protocol=''
                injectScript
                onLoading={() => {}}
                onSuccess={() => {}}
                onAfterRender={() => {}}
                onFailure={() => {}}
              />
            */}
          </div>
          

        </div>
        {user?.displayName ? (
        <ImageUpload username={user.displayName} />
      ): (<p></p>)}
        
    </div>
  );
}

export default App;
