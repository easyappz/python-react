/** Не редактируй этот файл */
document.addEventListener('DOMContentLoaded', function() {
  let currentHoverElement = null;
  let easyEditMode = false;

  // Обработчик сообщений для включения/выключения режима редактирования
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'enableEasyEditMode') {
      easyEditMode = true;
      document.body.classList.add('easy-mode-edit');
      initEasyTagHandlers();
      console.log('✅ Easy edit mode enabled');
    }
    
    if (event.data && event.data.type === 'disableEasyEditMode') {
      easyEditMode = false;
      document.body.classList.remove('easy-mode-edit');
      removeEasyTagHandlers();
      console.log('❌ Easy edit mode disabled');
    }
  });

  // Функция для удаления всех обработчиков
  function removeEasyTagHandlers() {
    document.removeEventListener('mouseover', handleMouseOver);
    document.removeEventListener('mouseout', handleMouseOut);
    document.removeEventListener('click', handleEasyTagClick);
    
    // Удаляем все подсказки
    const labels = document.querySelectorAll('.easy-tag-label');
    labels.forEach(label => label.remove());
    
    // Убираем выделение со всех элементов
    const highlighted = document.querySelectorAll('.easy-hover-active');
    highlighted.forEach(element => element.classList.remove('easy-hover-active'));
    
    currentHoverElement = null;
  }

  // Обработчики для показа/скрытия подсказки
  function handleMouseOver(event) {
    if (!easyEditMode) return;
    
    const element = event.target;
    
    // Пропускаем элементы, которые уже выделены или являются подсказками
    if (element === currentHoverElement || element.classList.contains('easy-tag-label')) return;
    
    // Убираем выделение с предыдущего элемента
    if (currentHoverElement) {
      currentHoverElement.classList.remove('easy-hover-active');
      const prevLabel = currentHoverElement.querySelector('.easy-tag-label');
      if (prevLabel) prevLabel.remove();
    }
    
    // Устанавливаем новый текущий элемент
    currentHoverElement = element;
    
    // Создаем подсказку
    const tagName = element.tagName.toLowerCase();
    const label = document.createElement('div');
    label.className = 'easy-tag-label';
    label.textContent = tagName;

    // Для очень маленьких элементов используем уменьшенную подсказку
    const rect = element.getBoundingClientRect();
    if (rect.width < 50 || rect.height < 30) {
      label.classList.add('small');
    }

    // Для элементов у правого края показываем подсказку справа
    if (rect.left > window.innerWidth - 100) {
      label.classList.add('top-right');
    }

    element.appendChild(label);
    element.classList.add('easy-hover-active');
  }

  function handleMouseOut(event) {
    if (!easyEditMode || !currentHoverElement) return;
    
    // Проверяем, покидаем ли мы текущий элемент
    const relatedTarget = event.relatedTarget;
    if (!relatedTarget) return;
    
    // Если мы переходим на элемент, который не является потомком текущего элемента
    if (!currentHoverElement.contains(relatedTarget)) {
      currentHoverElement.classList.remove('easy-hover-active');
      const label = currentHoverElement.querySelector('.easy-tag-label');
      if (label) label.remove();
      currentHoverElement = null;
    }
  }

  // Функция для инициализации обработчиков событий
  function initEasyTagHandlers() {
    // Добавляем обработчики на весь документ
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('click', handleEasyTagClick);
  }

  // Обработчик клика по любым элементам
  function handleEasyTagClick(event) {
    if (!easyEditMode) return;

    event.stopPropagation();
    event.preventDefault();
    
    const element = event.target;
    const tagName = element.tagName.toLowerCase();
    
    console.log('Clicked element:', { 
      tag: tagName,
      element: element
    });

    const closestParentEasyTag = element.closest('[data-easytag]');
    const closestParentEasyTagValue = closestParentEasyTag ? closestParentEasyTag.getAttribute('data-easytag') : null;
    const classes = element.className.replace('easy-hover-active', '');

    const data = `"${tagName}" ${classes ? `with classes: ${classes}` : 'without classes'} in Component: ${closestParentEasyTagValue}`

    const messageData = {
      type: 'easyTagClick',
      timestamp: new Date().toISOString(),
      tagName: tagName,
      data: data,
      elementInfo: {
        tag: tagName,
        classes: classes,
        id: element.id,
        innerText: element.innerText ? element.innerText.substring(0, 100) : '',
        innerHTML: element.innerHTML ? element.innerHTML.substring(0, 200) : ''
      }
    };

    console.log({
      messageData,
    });

    if (window.parent.postMessage) {
      window.parent.postMessage(messageData, '*');
    }
  }

  // Инициализация при загрузке, если режим уже активен
  if (document.body.classList.contains('easy-mode-edit')) {
    easyEditMode = true;
    initEasyTagHandlers();
  }
});