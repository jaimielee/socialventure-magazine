export {};
type Item = { name: string; spec: string; qty: number; unit: string; price: number };
type Quote = { version: 1; fields: Record<string,string>; vat: boolean; items: Item[] };
const form = document.querySelector<HTMLFormElement>('#quote-form')!;
const quoteStatus = document.querySelector<HTMLElement>('#quote-status')!;
const itemInputs = document.querySelector<HTMLElement>('#item-inputs')!;
const key = 'socialventure-quote-v1';
const supplier:Record<string,string> = {company:'플러그인 주식회사',owner:'이정민',business:'464-86-02680',phone:'010-3128-5863 / jm_cd@naver.com',address:'경기도 화성시 팔탄면 서근리 14-68'};
const applySupplier = () => Object.entries(supplier).forEach(([name,value])=>{control(name).value=value;});
const names = ['project','recipient','contact','number','date','valid','company','owner','business','phone','address','notes'];
const won = (n:number) => `${n.toLocaleString('ko-KR')}원`;
const control = (name:string) => form.elements.namedItem(name) as HTMLInputElement;
const blankItem = ():Item => ({name:'',spec:'',qty:1,unit:'식',price:0});
const today = () => new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date());
let items:Item[] = [blankItem()];
const setText = (id:string,text:string) => { document.getElementById(id)!.textContent=text; };
function snapshot():Quote { return {version:1,fields:Object.fromEntries(names.map(n=>[n,control(n).value])),vat:control('vat').checked,items}; }
function render() {
  const q=snapshot();
  document.querySelectorAll<HTMLElement>('[data-value]').forEach(el=>{el.textContent=q.fields[el.dataset.value!] || (['notes','valid'].includes(el.dataset.value!)?'':'—');});
  document.getElementById('valid-line')!.hidden=!q.fields.valid.trim();
  const body=document.getElementById('preview-items')!;body.replaceChildren();
  let supply=0;
  items.forEach((it,i)=>{
    const amount=Math.round(it.qty*it.price);supply+=amount;
    const row=document.createElement('tr');
    [String(i+1),it.name||'항목명',amount.toLocaleString('ko-KR')].forEach(v=>{const cell=document.createElement('td');cell.textContent=v;row.append(cell);});body.append(row);
  });
  const vat=q.vat?Math.round(supply*.1):0;
  setText('supply-total',won(supply));setText('vat-total',won(vat));setText('grand-total',won(supply+vat));setText('bottom-total',won(supply+vat));setText('tax-label',q.vat?'부가세 포함':'부가세 제외');
}
function renderInputs() {
  itemInputs.replaceChildren();
  items.forEach((it,i)=>{
    const group=document.createElement('div');group.className='quote-row-editor';
    const fields: ['name'|'price',string][]=[['name','품목 / 작업 내용'],['price','금액 (원)']];
    fields.forEach(([field,label])=>{
      const wrap=document.createElement('label');wrap.textContent=`${i+1}. ${label}`;if(field==='name')wrap.className='wide';
      const input=document.createElement('input');input.value=String(it[field]);input.setAttribute('aria-label',`${i+1}번 ${label}`);
      if(field==='price'){input.type='number';input.min='0';input.max='10000000000000';input.step='1';}
      else input.maxLength=300;
      input.addEventListener('input',()=>{if(field==='price'){if(!input.checkValidity()){quoteStatus.textContent='금액은 0~10,000,000,000,000 범위의 정수로 입력하세요.';return;}it[field]=Number(input.value)||0;}else{it[field]=input.value;}quoteStatus.textContent='수정 내용이 있습니다. 보관하려면 저장을 눌러주세요.';render();});
      wrap.append(input);group.append(wrap);
    });
    const remove=document.createElement('button');remove.type='button';remove.className='remove';remove.textContent='항목 삭제';remove.setAttribute('aria-label',`${i+1}번 항목 삭제`);
    remove.addEventListener('click',()=>{items.splice(i,1);if(!items.length)items=[blankItem()];renderInputs();render();});group.append(remove);itemInputs.append(group);
  });
}
function validate(raw:unknown):Quote {
  const q=raw as Quote;
  if(!q||q.version!==1||!q.fields||typeof q.vat!=='boolean'||!Array.isArray(q.items)||q.items.length<1||q.items.length>100)throw Error('올바른 견적서 파일이 아닙니다.');
  for(const n of names)if(typeof q.fields[n]!=='string'||q.fields[n].length>(n==='notes'?5000:200))throw Error('입력 정보의 형식이나 길이를 확인하세요.');
  for(const it of q.items){if(!it||['name','spec','unit'].some(n=>typeof it[n as keyof Item]!=='string'||String(it[n as keyof Item]).length>300)||!Number.isFinite(it.qty)||!Number.isFinite(it.price)||it.qty<0||it.qty>1e4||it.price<0||it.price>1e13||it.qty*it.price>1e13||!Number.isInteger(it.price))throw Error('항목의 수량과 단가를 확인하세요.');}
  return q;
}
function load(q:Quote){names.forEach(n=>{control(n).value=q.fields[n];});control('vat').checked=q.vat;applySupplier();items=q.items.map(it=>({...it,qty:1,price:Math.round(it.qty*it.price)}));renderInputs();render();}
function reset(){form.reset();names.forEach(n=>{control(n).value='';});control('date').value=today();control('number').value=`QT-${today().replaceAll('-','')}-01`;applySupplier();items=[blankItem()];renderInputs();render();}
function validForm(){if(!form.reportValidity()){quoteStatus.textContent='입력값을 확인하세요.';return false;}return true;}
form.addEventListener('submit',e=>e.preventDefault());
form.addEventListener('input',()=>{render();});
document.getElementById('add-item')!.addEventListener('click',()=>{if(items.length>=100){quoteStatus.textContent='항목은 최대 100개까지 추가할 수 있습니다.';return;}items.push(blankItem());renderInputs();render();});
document.getElementById('save-quote')!.addEventListener('click',()=>{if(!validForm())return;try{localStorage.setItem(key,JSON.stringify(snapshot()));quoteStatus.textContent='이 브라우저에 저장했습니다. 다음 방문 시 복원됩니다.';}catch{quoteStatus.textContent='브라우저 저장이 불가능합니다. 파일로 저장해 주세요.';}});
document.getElementById('export-quote')!.addEventListener('click',()=>{if(!validForm())return;const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot(),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`견적서-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);quoteStatus.textContent='견적서 파일을 저장했습니다. 다른 PC에서 불러올 수 있습니다.';});
document.getElementById('import-quote')!.addEventListener('change',async e=>{const input=e.target as HTMLInputElement;const file=input.files?.[0];if(!file)return;try{if(file.size>1000000)throw Error('1MB 이하의 견적서 파일을 선택하세요.');const q=validate(JSON.parse(await file.text()));if(confirm('현재 입력 내용을 불러온 견적서로 바꿀까요?')){load(q);quoteStatus.textContent='파일을 불러왔습니다. 브라우저 보관은 저장 버튼을 눌러주세요.';}}catch(err){quoteStatus.textContent=err instanceof Error?err.message:'파일을 읽을 수 없습니다.';}input.value='';});
document.getElementById('reset-quote')!.addEventListener('click',()=>{if(confirm('현재 작성 중인 내용을 비우고 새 견적서를 만들까요? 저장한 파일은 유지됩니다.')){reset();try{localStorage.removeItem(key);}catch{}quoteStatus.textContent='새 견적서를 시작합니다.';}});
document.getElementById('print-quote')!.addEventListener('click',async()=>{if(!validForm())return;if(!control('recipient').value.trim()||!control('company').value.trim()||!control('date').value||items.some(it=>!it.name.trim())){quoteStatus.textContent='인쇄 전 수신 회사, 공급자 상호, 작성일, 항목명을 입력하세요.';return;}await document.fonts.ready;const logo=document.querySelector<HTMLImageElement>('.document-head img');if(logo){try{await logo.decode();}catch{quoteStatus.textContent='로고를 불러오지 못했습니다. 새로고침 후 다시 인쇄해 주세요.';return;}}window.print();});
reset();try{const saved=localStorage.getItem(key);if(saved){load(validate(JSON.parse(saved)));quoteStatus.textContent='이 브라우저에 저장된 견적서를 복원했습니다.';}}catch{quoteStatus.textContent='저장된 내용을 복원하지 못했습니다. 파일을 불러오거나 새로 작성하세요.';}

