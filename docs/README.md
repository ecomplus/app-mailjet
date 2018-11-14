# Transactional e-mails structure

## Summary

1. [Introduction](#introduction)

2. [List of transactional emails](#list_of_transactional_emails)

3. [Examples](#examples)
    
    * [Order confirmation](#order_confirmation)

    * [Payment confirmation](#payment_confirmation)

    * [Shipping confirmation](#shipping_confirmation)

    * [Delivery confirmation](#delivery_confirmation)

    * [Order invoice](#order_invoice)

    * [Cancellation confirmation](#cancellation_confirmation)

    * [Refund confirmation](#refund_confirmation)

    * [New user](#new_user)

    * [Abandoned cart](#abandoned_cart)

{% raw %}

# Introduction

This document is intended to list predefined variables when building custom transactional e-mails to be sent to customers via [Mailjet](https://www.mailjet.com/). Each of these e-mails are triggred by changes in a store's order, cart or customer. 

In these transactional e-mails you can use custom info about the resource you are reffering to. To use this info, you have to set variables in your <a href="https://app.mailjet.com/templates/transactional">Mailjet transactional emails</a>, following <a href="https://dev.mailjet.com/template-language/reference/">Mailjet's template language</a> and our <a href="https://developers.e-com.plus/docs/api/#/store/orders/order-object">order</a>, <a href="https://developers.e-com.plus/docs/api/#/store/carts/cart-object">cart</a>, and <a href="https://developers.e-com.plus/docs/api/#/store/customers/customers">customer</a> data structures.

<h1 id="list_of_transactional_emails"> List of transactional emails </h1>

In the following table you can see the customizable e-mails.

|	E-mail	| Description	|	Link to	example	|
| :---:  | :---: | :---: |
|	Order confirmation	|	Notify customers that their payment has been processed.	| <a href="#order_confirmation">Example</a> 	|	
|	Payment confirmation	| Notify customers that their payment has been corfirmed.	|	<a href="#payment_confirmation">Example</a>	|	
|	Shipping confirmation	|	Notify customers that their order is on the way| <a href="#shipping_confirmation">Example</a>	|	
|	Delivery confirmation	|	Notify the user that the package was delivered	| <a href="#delivery_confirmation">Example</a>	|	
|	Order invoice	|	Send a receipt to customers when they buy something from your store.	| <a href="#order_invoice">Example</a>	|	
|	Cancellation confirmation	|	Notify customers that their order has been cancelled	| <a href="#cancellation_confirmation">Example</a>	|	
|	Refund confirmation	|	Notify customers that their refund has been processed| <a href="#refund_confirmation">Example</a>	|	
|	New user	|	Notify users about their registration	| <a href="#new_user">Example</a>	|	
|	Abandoned cart	|	Notify customer one day after his cart is abandoned 	| <a href="#abandoned_cart">Example</a>	|	



## Examples

<h3 id="order_confirmation">Order confirmation</h3>

In the following code you can see the example of an e-mail sent right after the buyer's finished the order in checkout. This e-mail uses our <a href="https://developers.e-com.plus/docs/api/#/store/orders/order-object"> Order data structure</a>.
 
```html
<html>
  <body>     
    <h1>Hello {{var:name}}! We just recived your order #{{var:number}}</h1>
    <p>
     Now we're waiting for the payment to be confirmed so we can send you this goodies: 
    </p>
    <ul>
      {% for item in var:items %}
        <li>
          Product: {{ item.name }} x {{items.quantity}} Price: {{ item.final_price }}
        </li>
      {% endfor %}
    </ul>
  </body>
</html>
```

<h3 id="payment_confirmation" > Payment confirmation </h3>

In the following code you can see the example of an e-mail sent right after the buyer's payment was aproved. This e-mail uses our <a href="https://developers.e-com.plus/docs/api/#/store/orders/order-object"> Order data structure</a>.
 
```html
<html>
  <body>     
    <h1>Hello {{var:name}}! your payment for order {{var:number}} was aproved</h1>
    <p>
      You just bought the the following amazing items:
    </p>
    <ul>
      {% for item in var:items %}
        <li>
          Product: {{ item.name }} x {{items.quantity}} Price: {{ item.final_price }}
        </li>
      {% endfor %}
    </ul>
    <p>
      Now you just wait the delivery!
    </p>
  </body>
</html>
```

<h3 id="shipping_confirmation" > Shipping confirmation </h3>

In the following code you can see the example of an e-mail sent when the shipping company starts the delivery process. This e-mail uses our <a href="https://developers.e-com.plus/docs/api/#/store/orders/order-object"> Order data structure</a>.
 
```html
<html>
  <body>     
    <h1>Hello {{ var:name }}! The products of order {{ var:number }} are on the way!</h1>
    <p>
      Here you can see your product(s) and it's delivery time:
    </p>
    <ul>
      {% for shipping_lines in var:shipping_lines %}
        <li>
          Days to deliver: {{ shipping_lines.delivery_time.days }}
          
          <ul>
           <p>Products:</p>
            {% for items in shipping_lines %}
              <li>
                {{ shipping_lines.items }}
              </li>
            {% endfor %}
          </ul>
        </li>
      {% endfor %}
    </ul>
  </body>
</html>
```

<h3 id="delivery_confirmation" > Delivery confirmation </h3>

In the following code you can see the example of an e-mail sent when the shipping company notify that the packege was delivered. This e-mail uses our <a href="https://developers.e-com.plus/docs/api/#/store/orders/order-object"> Order data structure</a>.
 
```html
<html>
  <body>     
    <h1>Hello {{ var:name }}, your package from order {{ var:number }} was delivered!</h1>
    <p>
      Now just enjoy your purchases. =)
      And do not forget, whenever you need us, we'll be here.
    </p>
   <p>
    Order details:
   </p>
   <ul>
      {% for item in var:items %}
        <li>
          Product: {{ item.name }}x {{items.quantity}}       Price: {{ item.final_price }}
        </li>
      {% endfor %}
    </ul>
  </body>
</html>
```

<h3 id="order_invoice" > Order invoice </h3>

In the following code you can see the example of an e-mail sent when a invoice is generated for the buying transaction. This e-mail uses our <a href="https://developers.e-com.plus/docs/api/#/store/orders/order-object"> Order data structure</a>.
 
```html
<html>
  <body>     
    <h1>Hello {{ var:name }}, here is the invoice generated for order {{var:number}}</h1>
    <li>
      {% for shipping_lines in var:shipping_lines %}
        {% for invoices in shipping_lines %}
          <a href="{{ shipping_lines.invoices.link }}">Link to download the invoice</a>
        {% endfor %}
      {% endfor %}
    </li>
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

<h3 id="cancellation_confirmation">  Cancellation confirmation </h3>

In the following code you can see the example of an e-mail sent when the buyer's payment was not aproved. This e-mail uses our <a href="https://developers.e-com.plus/docs/api/#/store/orders/order-object"> Order data structure</a>.
 
```html
<html>
  <body>     
    <h1>Hello {{ var:name }}, your payment for order {{var:number}} was aproved</h1>
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

<h3 id="refund_confirmation" > Refund confirmation </h3>

In the following code you can see the example of an e-mail sent when the buyer's payment amount is refunded. This e-mail uses our <a href="https://developers.e-com.plus/docs/api/#/store/orders/order-object"> Order data structure</a>.
 
```html
<html>
  <body>     
    <h1>Hello {{ var:name }},</h1>
    <p>
       We refunded the payment relative to order {{var:number}}
    <br>
      We hope you had a great experience and come back visiting our store soon!
    </p>
  </body>
</html>
```

<h3 id="new_user" > New user </h3>

In the following code you can see the example of an e-mail sent to new useers when loggin in the first time in the store. This e-mail uses our <a href="https://developers.e-com.plus/docs/api/#/store/customers/customers"> Customer data structure</a>.
 
```html
<html>
  <body>     
    <h1>Hello {{var:name}}, it's a plesure to see you here!</h1>
    
    Your registration was successful, enjoy our offers!!
   
  </body>
</html>
```

<h3 id="abandoned_cart"> Abandoned cart </h3>

In the following code you can see the example of an e-mail sent right after the buyer's payment was aproved. This e-mail uses our <a href="https://developers.e-com.plus/docs/api/#/store/carts/carts"> Order data structure</a>.
 
```html
<html>
  <body>     
    <h1>Hello {{var:name}}, looks like you forgot some items in the cart</h1>
    <p>
      Take a closer look in the items that you are missing:
    </p>
    <ul>
      {% for item in var:items %}
        <li>
          Product: {{ item.name }}
        </li>
      {% endfor %}
    </ul>
  </body>
</html>
```
{% endraw %}
