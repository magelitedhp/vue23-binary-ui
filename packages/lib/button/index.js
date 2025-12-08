import MyButton from './src/Button.vue'
MyButton.install = app => app.component(MyButton.name, MyButton)
export default MyButton