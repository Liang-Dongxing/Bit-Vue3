import svgs from '@/components/IconSelect/svg';
let icons = [];
// const modules = import.meta.glob('./../../assets/icons/svg/*.svg');
// for (const path in modules) {
//   const p = path.split('assets/icons/svg/')[1].split('.svg')[0];
//   icons.push(p);
// }
icons.push(...svgs);
export default icons;
