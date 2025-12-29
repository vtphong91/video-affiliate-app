# Create tracking link

**Method: POST**

#### HTTP Request <a href="#http-request" id="http-request"></a>

```
https://api.accesstrade.vn/v1/product_link/create
```

#### Data Parameter <a href="#query-parameters" id="query-parameters"></a>

| Params        | Required | Descriptions       |
| ------------- | -------- | ------------------ |
| campaign\_id  | Required | Campaign ID        |
| urls          | Optional | List link          |
| utm\_source   | Optional | Addition parameter |
| utm\_medium   | Optional | Addition parameter |
| utm\_campaign | Optional | Addition parameter |
| utm\_content  | Optional | Addition parameter |
| sub1          | Optional | Addition parameter |
| sub2          | Optional | Addition parameter |
| sub3          | Optional | Addition parameter |
| sub4          | Optional | Addition parameter |

> CURL Example
>
> ```
>
> curl --location 'https://api.accesstrade.vn//v1/product_link/create' \
> --header 'Content-Type: application/json' \
> --header 'Authorization: token {your_token}' \
> --data '{
>     "campaign_id": "4348614231480407268",
>     "urls": ["https://shopee.vn/m/ma-giam-gia","https://shopee.vn/m/ma-giam-gia1"],
>     "utm_source": "test_source",
>     "url_enc": true,
>     "utm_medium": "test_medium",
>     "utm_campaign": "test_campaign",
>     "utm_content": "test_content",
>     "sub1": "test_sub1",
>     "sub2": "test_sub2",
>     "sub3": "test_sub3"
>     }'
> ```

**API response:**

````
```json
{
    "data": {
        "error_link": [],
        "success_link": [
            {
                "aff_link": "https://tracking.dev.accesstrade.me/deep_link/4348611760548105593/4751584435713464237?utm_campaign=test_campaign&sub4=test_sub4&sub2=test_sub2&sub3=test_sub3&sub1=test_sub1&url=https%3A%2F%2Fshopee.vn&utm_content=test_content&utm_source=test_source&utm_medium=test_medium",
                "first_link": null,
                "short_link": "https://shorten.dev.accesstrade.me/ujrBHxpc",
                "url_origin": "https://shopee.vn"
            }
        ],
        "suspend_url": []
    },
    "success": true
}
```
````
