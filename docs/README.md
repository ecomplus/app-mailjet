# Transactional e-mails structure

This document is intended to list predefined Contact Properties names's when building custom transactional e-mails sent to customers via [Mailjet](https://www.mailjet.com/). Each of these e-mails are triggred by changes in a store's Order, Cart or Customer. In the following table you can see the customizable e-mails.

|	E-mail	| Description	|	Link to	example	|
| :---:       | :---: | :---: |
|	Order confirmation	|	Send a receipt to customers when they buy something from your store.	| <a href="order_confirmation">Example</a> 	|	
|	Payment confirmation	| Notify customars that their payment was confirmed	|	<a href="payment_confirmation">Example</a>	|	
|	Shipping confirmation	|	Notify customers that their order is on the way.| <a href="shipping_confirmation">Example</a>	|	
|	Delivery confirmation	|	Notify the user that the package was delivered	| <a href="delivery_confirmation">Example</a>	|	
|	Order invoice	|	Notify customers that their payment has been processed.	| <a href="order_invoice">Example</a>	|	
|	Cancellation confirmation	|	Notify customers that their order has been cancelled.	| <a href="cancellation_confirmation">Example</a>	|	
|	Refund confirmation	|	Notify customers that their refund has been processed.| <a href="refund_confirmation">Example</a>	|	
|	New user	|	Notify users about their registration	| <a href="new_user">Example</a>	|	
|	Abandoned cart	|	Notify customer one day after his cart is abandoned 	| <a href="abandoned_cart">Example</a>	|	


In these transactional e-mails you can use custom info about the order, cart or customer you are reffering to. To use this info, you have to set variables in your <a href="https://app.mailjet.com/templates/transactional">Mailjet transactional emails</a>, following <a href="https://dev.mailjet.com/template-language/reference/">Mailjet's template language</a>, with the same property name that this info is given in our data structure. 

Links to visualyze our resource's full data structure

<a href="https://developers.e-com.plus/docs/api/#/store/orders/order-object">Order data structure </a>
<a href="https://developers.e-com.plus/docs/api/#/store/carts/cart-object">Cart data structure</a>
<a href="https://developers.e-com.plus/docs/api/#/store/customers/customers">Customer data structure</a>

<h2 id="payment_confirmation" Payment confirmation>

In the following code you can see the example of an e-mail sent right after the buyer's payment was aproved. This e-mail uses our <a href="https://developers.e-com.plus/docs/api/#/store/orders/order-object"> Order data structure</a>.
 
```html

<html>
  <body>     
    <h1>Hello, your payment for order {{var:number}} was aproved</h1>
    <p>
      You just bought the the following items:
    </p>
    <ul>
      {% for item in var:items %}
        <li>
          Product: {{ item.name }} Price: {{ item.final_price }}
        </li>
      {% endfor %}
    </ul>
    <p>
      Now you just got to wait the delivery!
    </p>
  </body>
</html>

```
<h2 id="order_confirmation">Order confirmation</h2>

In the following code you can see the example of an e-mail sent right after the buyer's finished the order in checkout. This e-mail uses our <a href="https://developers.e-com.plus/docs/api/#/store/orders/order-object"> Order data structure</a>.
 
```html

<html>
  <body>     
    <h1>Hello, your payment for order {{var:number}} was aproved</h1>
    <p>
      You just bought the the following items:
    </p>
    <ul>
      {% for item in var:items %}
        <li>
          Product: {{ item.name }} Price: {{ item.final_price }}
        </li>
      {% endfor %}
    </ul>
    <p>
      Now you just got to wait the delivery!
    </p>
  </body>
</html>

```

<h2 id="shipping_confirmation" Shipping confirmation>

In the following code you can see the example of an e-mail sent when the shipping company starts the delivery process. This e-mail uses our <a href="https://developers.e-com.plus/docs/api/#/store/orders/order-object"> Order data structure</a>.
 
```html

<html>
  <body>     
    <h1>Hello, your payment for order {{var:number}} was aproved</h1>
    <p>
      You just bought the the following items:
    </p>
    <ul>
      {% for item in var:items %}
        <li>
          Product: {{ item.name }} Price: {{ item.final_price }}
        </li>
      {% endfor %}
    </ul>
    <p>
      Now you just got to wait the delivery!
    </p>
  </body>
</html>

```

<h2 id="delivery_confirmation" Delivery confirmation>

In the following code you can see the example of an e-mail sent when the shipping company notify that the packege was delivered. This e-mail uses our <a href="https://developers.e-com.plus/docs/api/#/store/orders/order-object"> Order data structure</a>.
 
```html

<html>
  <body>     
    <h1>Hello, your payment for order {{var:number}} was aproved</h1>
    <p>
      You just bought the the following items:
    </p>
    <ul>
      {% for item in var:items %}
        <li>
          Product: {{ item.name }} Price: {{ item.final_price }}
        </li>
      {% endfor %}
    </ul>
    <p>
      Now you just got to wait the delivery!
    </p>
  </body>
</html>

```

<h2 id="order_invoice" Order invoice>

In the following code you can see the example of an e-mail sent when a invoice is generated for the buying transaction. This e-mail uses our <a href="https://developers.e-com.plus/docs/api/#/store/orders/order-object"> Order data structure</a>.
 
```html

<html>
  <body>     
    <h1>Hello, your payment for order {{var:number}} was aproved</h1>
    <p>
      You just bought the the following items:
    </p>
    <ul>
      {% for item in var:items %}
        <li>
          Product: {{ item.name }} Price: {{ item.final_price }}
        </li>
      {% endfor %}
    </ul>
    <p>
      Now you just got to wait the delivery!
    </p>
  </body>
</html>

```

<h2 id="cancellation_confirmation" Cancellation confirmation>

In the following code you can see the example of an e-mail sent when the buyer's payment was not aproved. This e-mail uses our <a href="https://developers.e-com.plus/docs/api/#/store/orders/order-object"> Order data structure</a>.
 
```html

<html>
  <body>     
    <h1>Hello, your payment for order {{var:number}} was aproved</h1>
    <p>
      You just bought the the following items:
    </p>
    <ul>
      {% for item in var:items %}
        <li>
          Product: {{ item.name }} Price: {{ item.final_price }}
        </li>
      {% endfor %}
    </ul>
    <p>
      Now you just got to wait the delivery!
    </p>
  </body>
</html>

```

<h2 id="Refund_confirmation" Refund confirmation>

In the following code you can see the example of an e-mail sent when the buyer's payment amount is refunded. This e-mail uses our <a href="https://developers.e-com.plus/docs/api/#/store/orders/order-object"> Order data structure</a>.
 
```html

<html>
  <body>     
    <h1>Hello, your payment for order {{var:number}} was aproved</h1>
    <p>
      You just bought the the following items:
    </p>
    <ul>
      {% for item in var:items %}
        <li>
          Product: {{ item.name }} Price: {{ item.final_price }}
        </li>
      {% endfor %}
    </ul>
    <p>
      Now you just got to wait the delivery!
    </p>
  </body>
</html>

```

<h2 id="new_user" New user>

In the following code you can see the example of an e-mail sent to new useers when loggin in the first time in the store. This e-mail uses our <a href="https://developers.e-com.plus/docs/api/#/store/customers/customers"> Customer data structure</a>.
 
```html

<html>
  <body>     
    <h1>Hello {{var:name.given_name}}, we are very happy in seeing you here</h1>
    
  </body>
</html>

```

<h2 id="abandoned_cart" Abandoned cart>

In the following code you can see the example of an e-mail sent right after the buyer's payment was aproved. This e-mail uses our <a href="https://developers.e-com.plus/docs/api/#/store/carts/carts"> Order data structure</a>.
 
```html

<html>
  <body>     
    <h1>Hello, your payment for order {{var:number}} was aproved</h1>
    <p>
      You just bought the the following items:
    </p>
    <ul>
      {% for item in var:items %}
        <li>
          Product: {{ item.name }} Price: {{ item.final_price }}
        </li>
      {% endfor %}
    </ul>
    <p>
      Now you just got to wait the delivery!
    </p>
  </body>
</html>

```
