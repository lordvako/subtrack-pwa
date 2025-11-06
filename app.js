// === localStorage ===
function getSubs(){
  try{ return JSON.parse(localStorage.getItem('subs')||'[]'); }
  catch{ return []; }
}
function setSubs(list){
  try{ localStorage.setItem('subs',JSON.stringify(list)); }
  catch{ console.warn('localStorage недоступен'); }
}

// === +1 месяц (как было) ===
function addMonths(date, n){
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0,10);
}

// === рендер таблицы ===
function render(){
  const rows = getSubs()
    .sort((a,b)=> new Date(a.nextPay) - new Date(b.nextPay))
    .map((s,idx)=>{
      const next = addMonths(s.nextPay,1);           // всегда +1 месяц
      const daysLeft = Math.ceil((new Date(next) - new Date()) / 86400000);
      const status = daysLeft < 0 ? '❌' : '✅';
      return `<tr>
                <td>${s.name}</td>
                <td>${s.price} ₽</td>
                <td>${next}</td>
                <td class="days">${daysLeft<0?'просрочено':`${daysLeft} дн.`}</td>
                <td class="status">${status}</td>
                <td class="del" onclick="del(${idx})">🗑️</td>
              </tr>`;
    }).join('');
  list.querySelector('tbody').innerHTML = rows || '<tr><td colspan="6">Подписок пока нет</td></tr>';
}

// === удаление ===
function del(idx){
  const subs = getSubs();
  subs.splice(idx,1);
  setSubs(subs);
  render();
}

// === добавление ===
addForm.onsubmit = e =>{
  e.preventDefault();
  const {name,price,nextPay} = addForm;                  // **без period**
  if(!name.value || !price.value || !nextPay.value){
    alert('Заполните все поля!');
    return;
  }
  const subs = getSubs();
  subs.push({name:name.value, price:price.value, nextPay:nextPay.value}); // **без period**
  setSubs(subs);

  // === визуальное подтверждение ===
  alert('Подписка добавлена!');
  console.log('Добавлено:', name.value, price.value, nextPay.value);

  addForm.reset();
  render();
};

document.addEventListener('DOMContentLoaded',()=>{
  render();
  addForm.nextPay.value = new Date().toISOString().slice(0,10);
});
