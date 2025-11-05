let __subs = [];                      // fallback на случай инкогнито

function getSubs(){
  try{ return JSON.parse(localStorage.getItem('subs')||'[]'); }
  catch{ return __subs; }
}
function setSubs(list){
  try{ localStorage.setItem('subs',JSON.stringify(list)); }
  catch{ __subs = list; }
}

function addMonths(date, n){
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0,10);
}

function render(){
  const rows = getSubs()
    .sort((a,b)=> new Date(a.nextPay) - new Date(b.nextPay))
    .map((s,idx)=>{
      const next = addMonths(s.nextPay,1);        // всегда +1 месяц
      return `<tr>
                <td>${s.name}</td>
                <td>${s.price} ₽</td>
                <td>${next}</td>
                <td class="del" onclick="del(${idx})">🗑️</td>
              </tr>`;
    }).join('');
  list.querySelector('tbody').innerHTML = rows || '<tr><td colspan="4">Подписок пока нет</td></tr>';
}

function del(idx){
  const subs = getSubs();
  subs.splice(idx,1);
  setSubs(subs);
  render();
}

addForm.onsubmit = e =>{
  e.preventDefault();
  const {name,price,nextPay} = addForm;
  const subs = getSubs();
  subs.push({name:name.value, price:price.value, nextPay:nextPay.value});
  setSubs(subs);
  addForm.reset();
  render();
};

document.addEventListener('DOMContentLoaded',()=>{
  render();
  addForm.nextPay.value = new Date().toISOString().slice(0,10);
});
