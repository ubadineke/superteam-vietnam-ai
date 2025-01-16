import axios from 'axios';

export async function getTwitterUserFollowing() {
  const response = await axios.get(`https://api.socialdata.tools/twitter/friends/list?user_id=1578004618289635330`, {
    headers: {
      Authorization: `Bearer ${process.env.SOCIAL_MEDIA_API}`,
      Accept: 'application/json',
    },
  });

  const users = response.data.users.map((user: any) => ({
    name: user.name,
    handle: user.screen_name,
  }));
  console.log(users[0]);
  return users;
}

export async function getTwitterUserRecentTweets() {
  const response = await axios.get(`https://api.socialdata.tools/twitter/user/1578004618289635330/tweets-and-replies`, {
    headers: {
      Authorization: `Bearer ${process.env.SOCIAL_MEDIA_API}`,
      Accept: 'application/json',
    },
  });

  const tweets = response.data.tweets.map((tweet: any) => tweet.full_text);
  return tweets;
}
