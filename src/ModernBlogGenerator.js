import styles from './modernBlogStyles';
import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '@aws-amplify/auth';


const API_GENERATE = 'https://voz35lfw6h.execute-api.ap-south-1.amazonaws.com/dev/generateblog';

// ... other imports and code ...

export default function ModernBlogGenerator() {

  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [error, setError] = useState('');
  const [activeBlog, setActiveBlog] = useState(null);

  // Fetch user's blogs from S3
  const fetchBlogs = async () => {
    setLoadingBlogs(true);
    try {
      const user = await getCurrentUser();
      const userSub = user.userId || user.username || (user.attributes && user.attributes.sub);
      // Blog listing logic moved here from listBlogsFromS3.js
      const apiUrl = 'https://voz35lfw6h.execute-api.ap-south-1.amazonaws.com/dev/listblogs';
      const response = await fetch(`${apiUrl}?user_sub=${userSub}`);
      if (!response.ok) throw new Error('Failed to fetch blogs');
      const data = await response.json();
      setBlogs(data.blogs);
      setActiveBlog(null); // Do not auto-select any blog
      // setResult(''); // Do not clear result here
    } catch (err) {
      setBlogs([]);
    } finally {
      setLoadingBlogs(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleGenerate = async () => {
    setResult('');
    setLoading(true);
    setError('');
    let userSub = '';
    try {
      const user = await getCurrentUser();
      userSub = user.userId;
    } catch (err) {
      setError('Could not get user identity');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(API_GENERATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blog_topic: topic, user_sub: userSub })
      });
      const data = await response.json();
      const generated = data.generation || data.generated_blog || (data.body && JSON.parse(data.body).generation);
      setResult(generated || 'No content generated.');
      setTopic('');
      fetchBlogs();
    } catch (err) {
      setResult('Failed to generate blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowBlog = (index) => {
    setActiveBlog(index);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>AI Blog Generator</h1>
      <p style={styles.subheading}>
        Generate high-quality, AI-powered blogs instantly. Enter your topic and let the AI do the writing!
      </p>
      <div style={styles.inputRow}>
        <input
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="Enter blog topic..."
          style={styles.input}
          disabled={loading}
        />
        <button
          style={styles.button}
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
        >
          {loading ? 'Generating...' : 'Generate Blog'}
        </button>
      </div>
      {error && <div style={styles.error}>{error}</div>}
      <div style={{ ...styles.loader, display: loading ? 'block' : 'none' }} />
      <div style={styles.output}>
        {activeBlog !== null && blogs[activeBlog] ? (
          <>
            <h3 style={{marginTop: 0, marginBottom: 8, color: '#1976d2'}}>
              {blogs[activeBlog].topic && blogs[activeBlog].topic.trim() !== "" ? blogs[activeBlog].topic : 'Untitled Blog'}
            </h3>
            <div>{blogs[activeBlog].content}</div>
          </>
        ) : result ? (
          <div>{result}</div>
        ) : (
          <span style={{color: '#888'}}>Select a past blog to view its content.</span>
        )}
      </div>
      <h2 style={styles.pastBlogsHeading}>Past Blogs</h2>
      <div style={styles.pastBlogsOutput}>
        {loadingBlogs ? (
          <div>Loading...</div>
        ) : blogs.length > 0 ? (
          blogs.map((b, i) => (
            <a
              href="#"
              key={i}
              style={{
                ...styles.blogLink,
                fontWeight: activeBlog === i ? 'bold' : 'normal',
                color: activeBlog === i ? '#1976d2' : styles.blogLink.color,
                textDecoration: activeBlog === i ? 'underline' : styles.blogLink.textDecoration
              }}
              onClick={e => { e.preventDefault(); handleShowBlog(i); }}
            >
              {b.topic && b.topic.trim() !== "" ? b.topic : 'Untitled Blog'}
            </a>
          ))
        ) : (
          <div style={{ color: '#888' }}>No past blogs yet. Generate one to see it here!</div>
        )}
      </div>
    </div>
  );
}
