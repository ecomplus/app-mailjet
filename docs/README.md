# Transactional e-mails structure

This document is intended to list predefined Contact Properties names's when building custom transactional e-mails sent to customers via [Mailjet](https://www.mailjet.com/). Each of these e-mails are triggred by changes in one of our resouces. Here, you can see wich of our Store API resourses can trigger the e-mail.

In  the following table you can see the customizable e-mails and the documentation of the object sent to  :

|	E-mail	|	Trigger source	|	Description	|
| :---:       | :---: | :---: |
|	Order confirmation	|	<a href="https://developers.e-com.plus/docs/api/#/store/orders/">Orders</a>	|	Send a receipt to customers when they buy something from your store.	|
|	Payment confirmation	|	<a href="https://developers.e-com.plus/docs/api/#/store/orders/">Orders</a>	|	Notify customars that their payment was confirmed	|
|	Shipping confirmation	|	<a href="https://developers.e-com.plus/docs/api/#/store/orders/">Orders</a>	|	Notify customers that their order is on the way.	|
|	Delivery confirmation	|	<a href="https://developers.e-com.plus/docs/api/#/store/orders/">Orders</a>	|	Notify the user that the package was delivered	|
|	Order invoice	|	<a href="https://developers.e-com.plus/docs/api/#/store/orders/">Orders</a>	|	Notify customers that their payment has been processed.	|
|	Cancellation confirmation	|	<a href="https://developers.e-com.plus/docs/api/#/store/orders/">Orders</a>	|	Notify customers that their order has been cancelled.	|
|	Refund confirmation	|	<a href="https://developers.e-com.plus/docs/api/#/store/orders/">Orders</a>	|	Notify customers that their refund has been processed.	|
|	New user	|	<a href="https://developers.e-com.plus/docs/api/#/store/customers/customers">Customer</a>	|	Notify users about their registration	|
|	Abandoned cart	|	<a href="https://developers.e-com.plus/docs/api/#/store/carts/carts">Cart</a>	|	Notify customer one day after his cart is abandoned 	|


In these transactional e-mails you can use custom info about the Order, Cart or Customer you are reffering to. To use this info, you have to set variables in your <a href="https://app.mailjet.com/templates/transactional">Mailjet e-mail template</a> with the same property name that this info is given in the triggering resource. 

## Payment confirmation

In the following code you can see an example of an  e-mail:

```html

&lt;html&gt;
  &lt;body&gt;     
    &lt;h1&gt;Hello, your payment for order {{var:number}} was aproved&lt;/h1&gt;
    &lt;p&gt;
      Thank you for buying hte  the following items:
    &lt;/p&gt;
    &lt;ul&gt;
      {% for item in var:items %}
        &lt;li&gt;
          Product: {{ item.name }} Price: {{ item.final_price }}
        &lt;/li&gt;
      {% endfor %}
    &lt;/ul&gt;
  &lt;/body&gt;
&lt;/html&gt;

```
