# app-mailjet

```javascript
{
	"mailjet_key": "4a83269978e73bcd86c39bed367f7290",
        "mailjet_secret": "7b0924da7ef44ce59f29c52da0d3a6ab",
        "mailjet_from": {
            "name": "Talisson",
            "email": "talissonf@gmail.com"
        },
        "mailjet_templates": [
            {
                "trigger": "order_confirmation",
                "id": 588725
            },
            {
                "trigger": "payment_confirmation",
                "id": 588725
            },
            {
                "trigger": "shipping_confirmation",
                "id": 588725
            },
            {
                "trigger": "delivery_confirmation",
                "id": 588725
            },
            {
                "trigger": "order_invoice",
                "id": 588725
            },
            {
                "trigger": "cancellation_confirmation",
                "id": 588725
            },
            {
                "trigger": "refund_confirmation",
                "id": 588725
            },
            {
                "trigger": "new_user",
                "id": 588725
            },
            {
                "trigger": "adandoned_cart",
                "id": 588725
            }
        ]
}
```

## Production server

Published at https://mailjet.ecomplus.biz.

### Continuous deployment

When app version is production ready,
[create a new release](https://github.com/ecomclub/app-mailjet/releases)
to run automatic deploy.
