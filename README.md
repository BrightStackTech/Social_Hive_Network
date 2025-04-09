# SocialHive 🎓

A platform designed to foster community and collaboration among students from various universities. With collaborative features such as groups, communiities, live sessions, _SocialHive_ is a small scale student hub.

### Live Link

👉 [SocialHive](https://Social_Hive_Network.vercel.app)

---

## Features 📌

- **Collaborative Groups**: Seamlessly manage and collaborate on group using chats and sharing study material.
- **Communities**: Share your common doubts and errors among community to get it solved immediately.
- **Live Sessions**: Host live sessions to collaborate accross various location seamlessly, for group study or any kind of topic.
- **Messaging & Networking**: Connect with peers through direct messaging and build connections across campuses.
- **Profile Customization**: Each student has a personalized space for sharing stories, tips, and project updates.

## Tech Stack 💻

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Hosting**: Frontend: Vercel, Backend: Render

---


A. To Download & Install this project, 

1. **Clone** this Repository:
 ```bash
git clone https://github.com/BrightStackTech/Social_Hive_Network.git
 ```
2. Install the dependencies:
   A. Backend
    ```bash
    cd backend
    npm install
    ```
   B. Frontend
    ```bash
    cd frontend
    npm install
    ```

B. To RUN this project,

1. RUN Backend
   ```bash
    cd backend
    npm start
   ```
2. RUN Frontend
   ```bash
    cd frontend
    npm run dev
   ```

**Backend will run on port _8000_ &**
**Frontend will run on port _5173_**


if ports are not free, 

1. use netstat command to know PID of the task running on that port:
 ```bash
netstat -aon | findstr :port_number
 ```

2. kill the task using taskkill command using PID:
 ```bash
taskkill /PID PID_number /F  
 ```

---
## Acknowledgments 🎉

- [Yog Vasaikar](https://github.com/freakynutzz100) for his insightful backend.
- [Preeth Kothari](https://github.com/KTFREE) for his platform, vite, frontend, for styling.

## Contributing 🤝

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

1. **Fork** the repository.
2. **Create** your feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit** your changes:
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push** to the branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open** a pull request
