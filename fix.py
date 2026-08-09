with open('public/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('''function showApp(which){
  document.getElementById('customerApp').classList.toggle('hide', which!=='customer');
  document.getElementById('adminApp').classList.toggle('hide', which!=='admin');
  window.scrollTo(0,0);
}''', '''function showApp(which){
  const c = document.getElementById('customerApp');
  if(c) c.classList.toggle('hide', which!=='customer');
  const a = document.getElementById('adminApp');
  if(a) a.classList.toggle('hide', which!=='admin');
  window.scrollTo(0,0);
}''')

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(content)


with open('public/admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('''function showApp(which){
  document.getElementById('customerApp').classList.toggle('hide', which!=='customer');
  document.getElementById('adminApp').classList.toggle('hide', which!=='admin');
  window.scrollTo(0,0);
}''', '''function showApp(which){
  const c = document.getElementById('customerApp');
  if(c) c.classList.toggle('hide', which!=='customer');
  const a = document.getElementById('adminApp');
  if(a) a.classList.toggle('hide', which!=='admin');
  window.scrollTo(0,0);
}''')

content = content.replace('</body>', '''<script>
  window.addEventListener('DOMContentLoaded', () => {
    // Only show admin options for admin portal
    const roleToggleRow = document.getElementById('suRoleToggle');
    if(roleToggleRow) roleToggleRow.style.display = 'none';
    const adminToggle = document.querySelector('.role-btn[data-role="admin"]');
    if(adminToggle) selectRole('admin', adminToggle);
    const demoCust = document.querySelector('button[onclick*="demoSignup(\\\'customer\\\')"]');
    if(demoCust) demoCust.style.display = 'none';
  });
</script>
</body>''')

with open('public/admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
