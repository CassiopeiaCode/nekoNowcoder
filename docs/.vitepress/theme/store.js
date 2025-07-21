import { reactive, watch } from 'vue';

// 从 localStorage 获取初始状态，并进行数据清洗
const getInitialState = () => {
  const savedState = localStorage.getItem('randomReadState');
  let parsedState = null;
  if (savedState) {
    try {
      parsedState = JSON.parse(savedState);
    } catch (e) {
      console.error("Failed to parse randomReadState from localStorage", e);
    }
  }
  
  // 确保返回的对象结构是正确的
  return {
    isActive: parsedState?.isActive || false,
    speed: typeof parsedState?.speed === 'number' ? parsedState.speed : 5,
    // problemList 不应该被持久化，因为它可能非常大并且是基于上下文的
    problemList: [],
  };
};

export const store = reactive(getInitialState());

// 监听状态变化并持久化到 localStorage
// 我们只持久化 isActive 和 speed
watch(() => ({ isActive: store.isActive, speed: store.speed }), (newState) => {
  localStorage.setItem('randomReadState', JSON.stringify(newState));
});

export function startRandomRead(problems) {
  // problemList 是临时的，只在当前会话中有效
  store.problemList = problems.map(p => ({ text: p.text, link: p.link }));
  store.isActive = true;
}

export function stopRandomRead() {
  store.isActive = false;
  store.problemList = []; // 清空列表
}