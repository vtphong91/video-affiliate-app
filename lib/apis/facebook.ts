import axios from 'axios';

const FACEBOOK_API_BASE = 'https://graph.facebook.com/v18.0';

export interface FacebookPostParams {
  pageId: string;
  accessToken: string;
  message: string;
  link: string;
}

export interface FacebookPostResponse {
  id: string;
  post_id: string;
}

/**
 * Post to Facebook Page
 */
export async function postToFacebookPage(
  params: FacebookPostParams
): Promise<{ postId: string; postUrl: string }> {
  try {
    const response = await axios.post<FacebookPostResponse>(
      `${FACEBOOK_API_BASE}/${params.pageId}/feed`,
      {
        message: params.message,
        link: params.link,
        access_token: params.accessToken,
      }
    );

    const postId = response.data.id;
    const postUrl = `https://www.facebook.com/${postId.replace('_', '/posts/')}`;

    return { postId, postUrl };
  } catch (error) {
    console.error('Error posting to Facebook:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message || 'Failed to post to Facebook'
      );
    }
    throw new Error('Failed to post to Facebook');
  }
}

/**
 * Get Facebook Page info
 */
export async function getFacebookPageInfo(
  pageId: string,
  accessToken: string
): Promise<{ id: string; name: string; followers: number }> {
  try {
    const response = await axios.get(
      `${FACEBOOK_API_BASE}/${pageId}`,
      {
        params: {
          fields: 'id,name,followers_count',
          access_token: accessToken,
        },
      }
    );

    return {
      id: response.data.id,
      name: response.data.name,
      followers: response.data.followers_count || 0,
    };
  } catch (error) {
    console.error('Error fetching Facebook page info:', error);
    throw new Error('Failed to fetch page information');
  }
}

/**
 * Verify Facebook access token
 */
export async function verifyFacebookToken(
  accessToken: string
): Promise<boolean> {
  try {
    const response = await axios.get(
      `${FACEBOOK_API_BASE}/me`,
      {
        params: {
          access_token: accessToken,
        },
      }
    );

    return !!response.data.id;
  } catch (error) {
    console.error('Error verifying Facebook token:', error);
    return false;
  }
}

/**
 * Get long-lived page access token
 * This is used to exchange a short-lived token for a long-lived one
 */
export async function getLongLivedToken(
  shortLivedToken: string,
  appId: string,
  appSecret: string
): Promise<string> {
  try {
    const response = await axios.get(
      `${FACEBOOK_API_BASE}/oauth/access_token`,
      {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: shortLivedToken,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting long-lived token:', error);
    throw new Error('Failed to exchange token');
  }
}

/**
 * Get Page access token from User access token
 */
export async function getPageAccessToken(
  userAccessToken: string,
  pageId: string
): Promise<string> {
  try {
    const response = await axios.get(
      `${FACEBOOK_API_BASE}/${pageId}`,
      {
        params: {
          fields: 'access_token',
          access_token: userAccessToken,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting page access token:', error);
    throw new Error('Failed to get page access token');
  }
}

/**
 * Format Facebook post message - Full review content (UPDATED for schedules)
 * Affiliate links are stored separately in schedules.affiliate_links field
 */
export function formatFacebookPost(params: {
  title: string;
  summary: string;
  pros: string[];
  cons: string[];
  targetAudience: string[];
  keywords: string[];
  channelName?: string;
  landingUrl: string;
}): string {
  const {
    title,
    summary,
    pros,
    cons,
    targetAudience,
    keywords,
    channelName,
    landingUrl
  } = params;

  let message = `🔥 ${title}\n\n`;

  // Summary
  message += `📝 ${summary}\n\n`;

  // Pros
  if (pros.length > 0) {
    message += '✅ ƯU ĐIỂM:\n';
    pros.slice(0, 5).forEach((pro) => {
      message += `• ${pro}\n`;
    });
    message += '\n';
  }

  // Cons
  if (cons.length > 0) {
    message += '⚠️ NHƯỢC ĐIỂM CẦN LƯU Ý:\n';
    cons.slice(0, 3).forEach((con) => {
      message += `• ${con}\n`;
    });
    message += '\n';
  }

        // Target Audience
        if (targetAudience.length > 0) {
          message += '👥 PHÙ HỢP VỚI:\n';
          targetAudience.forEach((audience) => {
            message += `• ${audience}\n`;
          });
          message += '\n';
        }

        // Copyright notice (corrected format)
        const channelCredit = channelName || 'kênh gốc';
        message += `⚖️Nội dung Video thuộc về kênh ${channelCredit} - Mọi thông tin về sản phẩm được tham khảo từ video. Bản quyền thuộc về kênh gốc.\n\n`;

  // Hashtags
  if (keywords.length > 0) {
    const hashtags = keywords
      .slice(0, 10)
      .map((k) => `#${k.replace(/\s+/g, '').replace(/[^\w\u00C0-\u1EF9]/g, '')}`);
    message += hashtags.join(' ');
  }

  return message;
}

/**
 * Schedule Facebook post (requires scheduling permissions)
 */
export async function scheduleFacebookPost(
  params: FacebookPostParams & { scheduledTime: Date }
): Promise<{ postId: string }> {
  try {
    const unixTime = Math.floor(params.scheduledTime.getTime() / 1000);

    const response = await axios.post<FacebookPostResponse>(
      `${FACEBOOK_API_BASE}/${params.pageId}/feed`,
      {
        message: params.message,
        link: params.link,
        published: false,
        scheduled_publish_time: unixTime,
        access_token: params.accessToken,
      }
    );

    return { postId: response.data.id };
  } catch (error) {
    console.error('Error scheduling Facebook post:', error);
    throw new Error('Failed to schedule post');
  }
}

/**
 * Delete Facebook post
 */
export async function deleteFacebookPost(
  postId: string,
  accessToken: string
): Promise<boolean> {
  try {
    await axios.delete(`${FACEBOOK_API_BASE}/${postId}`, {
      params: { access_token: accessToken },
    });

    return true;
  } catch (error) {
    console.error('Error deleting Facebook post:', error);
    return false;
  }
}
