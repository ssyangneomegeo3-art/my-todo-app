let todos = [];
let currentFilter = 'all';
let todoChartInstance = null;

const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const filterBtns = document.querySelectorAll('.filter-btn');

async function fetchQuote() {
  const quoteEl = document.getElementById('quote');
  const authorEl = document.getElementById('author');
  const spinner = document.getElementById('spinner');

  spinner.style.display = 'block';
  quoteEl.textContent = '';
  authorEl.textContent = '';

  try {
    const response = await fetch('https://korean-advice-open-api.vercel.app/api/advice');
    if (!response.ok) throw new Error('서버 응답 실패');
    const data = await response.json();
    quoteEl.textContent = `"${data.message}"`;
    authorEl.textContent = `- ${data.author}`;
  } catch (error) {
    quoteEl.textContent = '⚠️ 명언을 불러오지 못했습니다.';
  } finally {
    spinner.style.display = 'none';
  }
}

document.getElementById('quote-btn').addEventListener('click', fetchQuote);
fetchQuote();

function saveTodos() {
  localStorage.setItem('myTodos', JSON.stringify(todos));
}

function loadTodos() {
  const savedData = localStorage.getItem('myTodos');
  if (savedData) {
    todos = JSON.parse(savedData);
  }
  renderTodos();
}

function updateChart() {
  const canvas = document.getElementById('todoChart');
  const rateEl = document.getElementById('rate-text');
  if (!canvas) return;

  const totalCount = todos.length;
  const completedCount = todos.filter(t => t.completed).length;
  const activeCount = totalCount - completedCount;

  const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  if (rateEl) {
    rateEl.textContent = `달성률: ${percentage}%`;
  }

  if (todoChartInstance) {
    todoChartInstance.destroy();
  }

  todoChartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['완료됨', '진행 중'],
      datasets: [{
        data: [completedCount, activeCount],
        backgroundColor: ['#4CAF50', '#FF9800'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, font: { size: 11 } }
        }
      }
    }
  });
}

function renderTodos() {
  todoList.innerHTML = '';

  const filteredTodos = todos.filter(todo => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
  });

  if (filteredTodos.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'empty-msg';
    emptyMsg.textContent = '해당하는 항목이 없습니다.';
    todoList.appendChild(emptyMsg);
  } else {
    filteredTodos.forEach(todo => {
      const li = document.createElement('li');

      const textSpan = document.createElement('span');
      textSpan.textContent = todo.text;
      textSpan.classList.add('todo-text');
      if (todo.completed) textSpan.classList.add('completed');

      textSpan.addEventListener('click', () => {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '삭제';
      deleteBtn.classList.add('delete-btn');
      deleteBtn.addEventListener('click', () => {
        todos = todos.filter(item => item.id !== todo.id);
        saveTodos();
        renderTodos();
      });

      li.appendChild(textSpan);
      li.appendChild(deleteBtn);
      todoList.appendChild(li);
    });
  }

  updateChart();
}

function addTodo() {
  const text = input.value.trim();
  if (text === '') {
    alert('할 일을 입력해 주세요!');
    return;
  }

  todos.push({
    id: Date.now(),
    text: text,
    completed: false
  });

  saveTodos();
  renderTodos();
  input.value = '';
}

addBtn.addEventListener('click', addTodo);
input.value.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    filterBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');

    currentFilter = e.target.dataset.filter;
    renderTodos();
  });
});

loadTodos();