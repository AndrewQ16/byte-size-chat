# byte-size-chat
A small chat app built with Node.JS, Express, Socket.io and MongoDB.

### Another messenger app?
Yup except in this case it was created to be easy-to-read so anyone can understand and make their own version. *Or if they'd like, could send a pull request.* 

### What can it do?
1. It can do private room based messaging for users who just enter a name and room in the window prompt (this will be a bit more formal as I continue).
2. Coming Soon :pray:

### What will it eventually it do?
Great question! I'll be updating this readme as new features get added. Currently the plan is the following:
1. Allow users to register via a registration page.
2. Authentication and authorization of users.
3. Tabs of rooms that users can go to and from.

### This sounds like Discord?
Right, this messenger app models it from a feature perspective, but probably not frontend as my frontend skills aren't that polished.

### How to install
1. Install ```node``` which means you'll also get ```npm``` installed.
2. Run ```npm install```
3. Install ```MongoDB``` locally. You won't need credentials.
4. On MongoDB you only need the following databases ```chat``` and ```test_chat```. The reason I have two is because one will be your "production" db and the other where the latter is the "test" one. I'm not sure if this part is correct practice, let me know if this isn't.
5. Each database will have two collections:
   1. ```users``` - this will hold users which will be an object: ```{username: 'myname, email: 'some@email.com', password: '123'} ```
   2. ```general``` - this is the default chat room.
6. Create a ```.env``` and ```.env.test``` files. I won't commit these files only because it's not good practice. However, the ```key:value``` pairs you will find are:
   1. ```MONGO_URL='mongodb://localhost:127.0.0.1:27017/'```
   2. ```DB='chat'```
   3.``` USERS='USERS'```
   1. ```GENERAL='general' ```
7. Now you can run the app with ```npm run devStart``` to run with nodemon and the ```.env``` development variables.
   


