// читаем / пишем в localStorage
function getSubs(){
  return JSON.parse(localStorage.getItem('subs')||'[]');
}
function setSubs(list){
  localStorage.setItem('subs',JSON.stringify(list));
}

// красивое «осталось»
function prettyDays(d){
  if(d<0) return 'просрочено';
  if(d===0) return 'сегодня';
  if(d===1) return 'завтра';
  return `через ${d} дн.`;
}

// рендер таблицы
function render(){
  const rows = getSubs()
    .sort((a,b)=> new Date(a.nextPay) - new Date(b.nextPay))
    .map(s=>{
      const days = Math.ceil((new Date(s.nextPay) - new Date()) / 86400000);
      return `<tr>
                <td>${s.name}</td>
                <td>${s.price} ₽</td>
                <td>${s.nextPay}</td>
                <td class="days">${prettyDays(days)}</td>
              </tr>`;
    }).join('');
  list.innerHTML = rows || '<tr><td colspan="4">Подписок пока нет</td></tr>';
}

// добавление
addForm.onsubmit = e =>{
  e.preventDefault();
  const {name,price,nextPay} = addForm;
  const subs = getSubs();
  subs.push({name:name.value, price:price.value, nextPay:nextPay.value});
  setSubs(subs);
  addForm.reset();
  render();
};

// начальная загрузка
document.addEventListener('DOMContentLoaded',()=>{
  render();
  // сегодня по умолчанию
  addForm.nextPay.value = new Date().toISOString().slice(0,10);
});