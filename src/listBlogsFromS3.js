// Fetch blogs for a user from Lambda via API Gateway
export async function fetchBlogsFromLambda(userSub) {
  const apiUrl = 'https://voz35lfw6h.execute-api.ap-south-1.amazonaws.com/dev/listblogs'; // <-- Your API Gateway URL
  const response = await fetch(`${apiUrl}?user_sub=${userSub}`);
  if (!response.ok) throw new Error('Failed to fetch blogs');
  const data = await response.json();
  return data.blogs;
}
