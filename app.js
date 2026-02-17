// Глобальная обработка ошибок
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Глобальная ошибка:", {
    message: message,
    source: source,
    line: lineno,
    column: colno,
    error: error
  });
  
  // Показываем уведомление об ошибке
  if (document.body) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'global-error';
    errorDiv.innerHTML = `
      <div class="error-content">
        <h3>Произошла ошибка</h3>
        <p>${error ? error.message : message}</p>
        <button onclick="window.location.reload()">Перезагрузить</button>
      </div>
    `;
    document.body.appendChild(errorDiv);
  }
  
  return true; // Предотвращаем стандартную обработку ошибки
};

// Инициализация Firebase
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Используем исправленный конфиг без лишних пробелов в URL!
    const firebaseConfig = {
      apiKey: "AIzaSyCPjjwqSk6EG6k3QZ6Yf5UzqDo5LEfo6GY",
      authDomain: "localhost-mini.firebaseapp.com",
      databaseURL: "https://localhost-mini-default-rtdb.firebaseio.com",
      projectId: "localhost-mini",
      storageBucket: "localhost-mini.firebasestorage.app",
      messagingSenderId: "465050030132",
      appId: "1:465050030132:web:49058758de3b054379ba61"
    };

    // Проверяем, не инициализировано ли уже приложение
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    
    const auth = firebase.auth();
    const database = firebase.database();
    let messaging = null;
    
    // Проверяем поддержку FCM
    if ('serviceWorker' in navigator && 'Notification' in window) {
      try {
        messaging = firebase.messaging();
      } catch (e) {
        console.warn("FCM недоступен:", e.message);
      }
    }

    // Проверка авторизации
    const protectedRoutes = ['chat.html', 'profile.html', 'settings.html'];
    const authRoutes = ['login.html', 'register.html'];
    const authSelection = 'auth.html';
    
    const currentPath = window.location.pathname.split('/').pop();
    
    // Обработчик состояния аутентификации с подробным логированием
    const authCheck = auth.onAuthStateChanged(user => {
      console.log("Состояние аутентификации изменено", {
        user: user ? user.email : "не авторизован",
        path: currentPath,
        timestamp: new Date().toISOString()
      });
      
      // Если пользователь авторизован, но находится на странице авторизации
      if (user && (authRoutes.includes(currentPath) || currentPath === authSelection)) {
        if (currentPath !== 'chat.html') {
          console.log("Перенаправление авторизованного пользователя в чат");
          window.location.href = 'chat.html';
        }
      } 
      // Если пользователь НЕ авторизован, но пытается зайти в защищенные разделы
      else if (!user && protectedRoutes.includes(currentPath)) {
        console.log("Перенаправление неавторизованного пользователя на авторизацию");
        window.location.href = 'auth.html';
      }
      
      // Инициализация чата только на нужной странице
      if (currentPath === 'chat.html' && user) {
        setupChat(user);
      }
      
      // Логика выхода
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          console.log("Пользователь нажал кнопку выхода");
          
          auth.signOut().then(() => {
            console.log("Выход успешен, перенаправление на главную");
            window.location.href = 'index.html';
          }).catch(error => {
            console.error("Ошибка выхода:", error);
            alert(`Не удалось выйти: ${error.message}`);
          });
        });
      }
    }, error => {
      console.error("Ошибка проверки сессии:", error);
      if (protectedRoutes.includes(currentPath)) {
        window.location.href = 'auth.html';
      }
    });
    
    // Обработка ошибок инициализации
    authCheck.catch(error => {
      console.error("Критическая ошибка Firebase:", error);
      if (protectedRoutes.includes(currentPath)) {
        window.location.href = 'auth.html';
      }
    });

  } catch (error) {
    console.error("Критическая ошибка инициализации Firebase:", error);
    
    // Показываем ошибку на экране
    if (document.body) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'init-error';
      errorDiv.innerHTML = `
        <div class="error-content">
          <h3>Ошибка подключения</h3>
          <p>${error.message}</p>
          <p class="error-details">Код: ${error.code || 'N/A'}</p>
          <button onclick="window.location.href='auth.html'">Продолжить без авторизации</button>
        </div>
      `;
      document.body.appendChild(errorDiv);
    }
  }
});

// Настройка чата
function setupChat(user) {
  try {
    const messagesRef = firebase.database().ref('main-chat');
    const messagesContainer = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    
    if (!messagesContainer || !messageInput || !sendBtn) {
      throw new Error("Элементы чата не найдены на странице");
    }
    
    // Загрузка сообщений
    messagesRef.on('child_added', snap => {
      const message = snap.val();
      const isOwn = message.user === user.email;
      
      const messageEl = document.createElement('div');
      messageEl.classList.add('message');
      if (isOwn) messageEl.classList.add('own');
      
      messageEl.innerHTML = `
        <div class="message-content">${message.text}</div>
        <div class="message-meta">${new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
      `;
      
      messagesContainer.appendChild(messageEl);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
    
    // Отправка сообщения
    const sendMessage = () => {
      const text = messageInput.value.trim();
      if (!text) return;
      
      messagesRef.push({
        text,
        user: user.email,
        timestamp: Date.now()
      });
      
      messageInput.value = '';
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };
    
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') sendMessage();
    });
    
    console.log("Чат успешно инициализирован");
    
  } catch (error) {
    console.error("Ошибка инициализации чата:", error);
    alert(`Ошибка чата: ${error.message}. Проверьте подключение к интернету.`);
  }
}