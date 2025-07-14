import { useEffect, useState } from 'react';

export default function Home() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');

  const fetchPosts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/posts');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  };
const handleCreate = async (e) => {
  e.preventDefault();

  const newPost = {
    title,
    content,
    tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
  };

  const res = await fetch('http://localhost:5000/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(newPost)
  });

  if (res.ok) {
    setTitle('');
    setContent('');
    setTags('');
    fetchPosts();
  }
};

  const handleDelete = async (id) => {
    const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) fetchPosts();
  };

  const startEditing = (post) => {
    setEditingId(post._id);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditTags(post.tags.join(', '));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
    setEditTags('');
  };

  const handleUpdate = async (id) => {
    const updatedPost = {
      title: editTitle,
      content: editContent,
      tags: editTags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatedPost)
    });

    if (res.ok) {
      cancelEditing();
      fetchPosts();
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    if (savedToken && savedUsername) {
      setToken(savedToken);
      setUsername(savedUsername);
    }
    fetchPosts();
  }, []);

 return (
  <div className="min-h-screen bg-gray-50 p-6">
    <h1 className="text-3xl font-bold mb-6 text-center text-gray-900"> Blog CMS</h1>

    {token && (
      <div className="text-center mb-4">
        <p className="text-gray-900">
          Logged in as <span className="font-semibold">{username}</span>
        </p>
        <button
          onClick={() => {
            setToken('');
            setUsername('');
            localStorage.removeItem('token');
            localStorage.removeItem('username');
          }}
          className="mt-2 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    )}

    {!token && (
      <div className="max-w-md mx-auto bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-2 text-center text-gray-900">
          {authMode === 'login' ? 'Login' : 'Sign Up'}
        </h2>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const endpoint = authMode === 'login' ? 'login' : 'register';
            const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: formUsername,
                password: formPassword
              })
            });

            const data = await res.json();
            if (res.ok) {
              if (endpoint === 'login') {
                setToken(data.token);
                setUsername(data.username);
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
              } else {
                alert(' Registered! Now login.');
                setAuthMode('login');
              }
              setFormPassword('');
            } else {
              alert(data.error || 'Something went wrong');
            }
          }}
          className="space-y-3"
        >
          <input
            className="w-full border p-2 rounded text-gray-900 placeholder-gray-300"
            placeholder="Username"
            value={formUsername}
            onChange={(e) => setFormUsername(e.target.value)}
            required
          />
          <input
            className="w-full border p-2 rounded text-gray-900 placeholder-gray-300"
            placeholder="Password"
            type="password"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {authMode === 'login' ? 'Login' : 'Sign Up'}
          </button>

          <p className="text-center text-sm text-gray-800">
            {authMode === 'login' ? "Don't have an account?" : 'Already have one?'}{' '}
            <button
              type="button"
              className="text-blue-600 underline"
              onClick={() =>
                setAuthMode(authMode === 'login' ? 'register' : 'login')
              }
            >
              {authMode === 'login' ? 'Sign up' : 'Login'}
            </button>
          </p>
        </form>
      </div>
    )}

    {token ? (
      <>
        <form
          onSubmit={handleCreate}
          className="bg-white p-4 rounded shadow max-w-3xl mx-auto mb-8 space-y-4"
        >
          <h2 className="text-xl font-semibold text-gray-900">Create a New Post</h2>

          <input
            className="w-full border p-2 rounded text-gray-900 placeholder-gray-300"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className="w-full border p-2 rounded text-gray-900 placeholder-gray-300"
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <input
            className="w-full border p-2 rounded text-gray-900 placeholder-gray-300"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Post
          </button>
        </form>

        <div className="max-w-3xl mx-auto space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="bg-white p-4 rounded shadow">
              {editingId === post._id ? (
                <>
                  <input
                    className="w-full border p-2 rounded mb-2 text-gray-900 placeholder-gray-300"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <textarea
                    className="w-full border p-2 rounded mb-2 text-gray-900 placeholder-gray-300"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <input
                    className="w-full border p-2 rounded mb-2 text-gray-900 placeholder-gray-300"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(post._id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-900">{post.title}</h2>
                  <p className="text-gray-900 mt-2">{post.content}</p>
                  {post.tags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-sm px-2 py-1 bg-blue-600 text-white rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 text-sm text-gray-700 italic">
                    Author: {post.username || 'Unknown'}
                  </div>
                  {post.username === username && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => startEditing(post)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </>
    ) : (
      <p className="text-center text-gray-800 mt-4">
        Please login or register to use the Blog CMS.
      </p>
    )}
  </div>
);




}
