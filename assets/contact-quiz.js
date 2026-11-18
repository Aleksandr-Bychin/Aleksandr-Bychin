(() => {
  const dialog = document.getElementById('contact-brief');
  const form = dialog.querySelector('.quiz-form');
  const result = dialog.querySelector('.quiz-result');
  for (const name of ['name', 'position']) {
    const input = form.elements.namedItem(name);
    const message = document.createElement('span');
    message.id = 'quiz-digit-error-' + name;
    message.className = 'quiz-field-error';
    message.setAttribute('aria-live', 'polite');
    input.setAttribute('aria-describedby', message.id);
    input.after(message);
    input.addEventListener('input', () => {
      const hasDigits = /\p{Nd}/u.test(input.value);
      input.setAttribute('aria-invalid', String(hasDigits));
      message.textContent = hasDigits ? 'Цифры в этом поле недопустимы.' : '';
    });
  }
  const groups = [
    ['О компании', [
      ['В какой сфере работает ваша компания?', 1, [
        'Банк / финансы / страхование', 'Контакт-центр / аутсорсинг коммуникаций',
        'Розница / e-commerce', 'DIY / стройматериалы / оборудование',
        'Производство / промышленность', 'ИТ / цифровые продукты',
        'Услуги (HoReCa, фарма, сервис)'
      ]],
      ['Сколько сотрудников нужно обучать?', 1, [
        'До 50 (точечная команда)', '50–300', '300–1000', 'Больше 1000 (массовый персонал)'
      ]],
      ['Кого в первую очередь обучаем?', 1, [
        'Новички на линейных позициях (продавцы, операторы, кассиры)',
        'Менеджеры и тимлиды', 'Опытные сотрудники — обновление знаний',
        'Вся компания (массовое обучение)'
      ]]
    ]],
    ['Боли и цели', [
      ['Что сейчас болит сильнее всего?', 2, [
        'Долгая адаптация новичков — «встанут в строй» только через месяцы',
        'Высокая текучка — учим, уходят, учим снова',
        'Сотрудники не знают продукт / ассортимент / регламенты',
        'Слабые продажи и сервис — скрипты не работают',
        'Руководители «горят» и не управляют командами',
        'Нет системы: обучение хаотичное, «по факту ЧП»',
        'Обязательные требования: охрана труда, ИБ, комплаенс'
      ]],
      ['Какая главная цель обучения на ближайшие 3–6 месяцев?', 1, [
        'Сократить срок выхода новичка на план', 'Поднять продажи / конверсию / NPS',
        'Закрыть обязательные программы (аттестации, допуски)',
        'Подготовить кадровый резерв и менеджеров',
        'Внедрить ИИ и новые инструменты в работу команд'
      ]]
    ]],
    ['Контент и формат', [
      ['Какие темы курсов интересуют?', 2, [
        'ИИ-навыки и цифровая грамотность (Excel, аналитика, ИИ-инструменты)',
        'Продуктовые знания и стандарты компании',
        'Продажи и работа с клиентами (скрипты, возражения, кросс-продажи)',
        'Управленческие навыки и лидерство', 'Кибербезопасность и комплаенс',
        'Soft skills: коммуникация, работа со стрессом', 'Иностранный язык / деловые коммуникации'
      ]],
      ['Какой формат обучения предпочтительнее?', 1, [
        'Короткие микроуроки 5–15 минут, «на рабочем месте»',
        'Полноценные онлайн-курсы с тренажёрами и тестами', 'Симуляторы разговоров / видео-практики',
        'Вебинары и живые занятия с тренером', 'Гибрид: онлайн + очные мероприятия',
        'Пока не знаю — нужен совет'
      ]],
      ['Что уже есть у компании?', 1, [
        'Своя LMS / HR-система — нужен только контент', 'Готовы взять платформу и курсы «под ключ»',
        'Есть контент, но нужна платформа и методологи', 'Ничего нет — стартуем с нуля'
      ]]
    ]]
  ];

  const answers = [];
  function create(tag, content) {
    const element = document.createElement(tag);
    if (content) element.textContent = content;
    return element;
  }

  for (const [title, questions] of groups) {
    const section = create('section');
    section.append(create('h3', title));
    for (const [question, limit, options] of questions) {
      const index = answers.length + 1;
      const fieldset = create('fieldset');
      const questionLabel = index + '. ' + question;
      fieldset.append(create('legend', questionLabel), create('p', limit === 1 ? 'Один вариант' : 'До двух вариантов'));
      const dropdown = create('details');
      dropdown.className = 'quiz-dropdown';
      const summary = create('summary', 'Выберите ответ');
      const choices = create('div');
      choices.className = 'quiz-dropdown-options';
      dropdown.append(summary, choices);
      const custom = create('input');
      custom.type = 'text';
      custom.id = 'quiz-custom-' + index;
      custom.maxLength = 240;
      const customLabel = create('label', 'Укажите свой вариант');
      customLabel.htmlFor = custom.id;
      const customField = create('div');
      customField.className = 'quiz-custom';
      customField.hidden = true;
      customField.append(customLabel, custom);
      const inputs = [...options, index === 1 ? 'Другое' : 'Свой вариант'].map(option => {
        const input = create('input');
        input.type = limit === 1 ? 'radio' : 'checkbox';
        input.name = 'quiz-answer-' + index;
        input.value = option;
        const label = create('label');
        label.className = 'quiz-choice';
        label.append(input, create('span', option));
        choices.append(label);
        return input;
      });
      const other = inputs.at(-1);
      function update() {
        const selected = inputs.filter(input => input.checked);
        summary.textContent = selected.length === 0 ? 'Выберите ответ'
          : limit === 1 ? selected[0].value : 'Выбрано: ' + selected.length + ' из ' + limit;
        if (limit === 2) {
          inputs.forEach(input => { input.disabled = !input.checked && selected.length >= limit; });
        }
        inputs[0].setCustomValidity(selected.length ? '' : 'Выберите хотя бы один вариант.');
        customField.hidden = !other.checked;
        custom.disabled = !other.checked;
        custom.required = other.checked;
        custom.setCustomValidity(other.checked && custom.value && !custom.value.trim() ? 'Введите свой вариант.' : '');
      }
      fieldset.addEventListener('change', update);
      fieldset.addEventListener('invalid', event => {
        if (choices.contains(event.target)) dropdown.open = true;
      }, true);
      custom.addEventListener('input', update);
      fieldset.append(dropdown, customField);
      section.append(fieldset);
      answers.push(() => [questionLabel, inputs.filter(input => input.checked).map(input => input === other ? custom.value.trim() : input.value).join('; ')]);
      update();
    }
    form.querySelector('.quiz-questions').append(section);
  }

  document.querySelector('[aria-controls="contact-brief"]').addEventListener('click', () => dialog.showModal());
  form.addEventListener('submit', event => {
    event.preventDefault();
    const fields = new FormData(form);
    const info = [['Имя', 'name'], ['Должность', 'position'], ['Компания', 'company']];
    for (const [, key] of info) {
      if (fields.get(key).trim()) continue;
      const input = form.elements.namedItem(key);
      input.setCustomValidity('Заполните это поле.');
      input.reportValidity();
      input.addEventListener('input', () => input.setCustomValidity(''), {once: true});
      return;
    }
    const channel = event.submitter?.value;
    if (!channel) return;
    const comment = fields.get('comment').trim();
    const message = ['Здравствуйте, Александр! Вот мой мини-бриф на электронный курс.',
      ...info.map(([label, key]) => label + ': ' + fields.get(key).trim()),
      'Канал связи: ' + channel, '', ...answers.map(read => read()).map(([question, answer]) => question + '\n' + answer),
      ...(comment ? ['', 'Комментарий: ' + comment] : [])
    ].join('\n');
    result.querySelector('textarea').value = message;
    const link = result.querySelector('a');
    const max = document.querySelector('a[data-contact-max]');
    link.hidden = channel === 'MAX' && !max;
    link.href = channel === 'Telegram' ? 'https://t.me/ABychin?text=' + encodeURIComponent(message)
      : channel === 'Почта' ? 'mailto:i@apbychin.ru?subject=' + encodeURIComponent('Мини-бриф на электронный курс') + '&body=' + encodeURIComponent(message)
      : max?.href || '#';
    link.textContent = channel === 'Почта' ? 'Открыть письмо' : 'Открыть ' + channel;
    result.querySelector('[data-max-note]').hidden = channel !== 'MAX';
    result.hidden = false;
    result.querySelector('textarea').focus();
  });
  form.addEventListener('input', () => { result.hidden = true; });
})();
