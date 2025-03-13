// 'use client';

// import { USAGES } from '@/components/ai/Data';
// import { motion } from 'framer-motion';
// import { scaleLinear } from 'd3-scale';
// import { useWindowSize } from 'react-use';

// export const UsageView = ({ type }: { type: 'electricity' | 'gas' | 'water' }) => {
//   const { width } = useWindowSize();
//   const usages = USAGES[type].slice(0, width < 768 ? 7 : 14);
//   const maxUsage = Math.max(...usages.map(usage => usage.amount));
//   const usageToHeight = scaleLinear().domain([0, maxUsage]).range([0, 150]);
//   const color = type === 'electricity' ? 'green' : type === 'gas' ? 'orange' : 'blue';

//   return (
//     <div className="flex w-full max-w-[calc(100dvw-80px)] flex-col gap-4 pb-6 md:max-w-[452px]">
//       <motion.div
//         className="flex flex-col"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 1 }}
//       >
//         <div className="text-sm text-zinc-500">Average Usage</div>
//         <div className="font-semibold">
//           {`${(usages.reduce((acc, usage) => acc + usage.amount, 0) / 14).toFixed()} ${
//             type === 'electricity' ? 'kWh' : type === 'gas' ? 'm³' : 'L'
//           }`}
//         </div>
//       </motion.div>

//       <div className="flex flex-row justify-between gap-6">
//         <motion.div
//           className="mt-auto flex h-full flex-col justify-between py-2"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 1 }}
//         >
//           {[100, 75, 50, 25, 0].map(label => (
//             <div key={label} className="mb-3 text-xs text-zinc-300">
//               {label}
//             </div>
//           ))}
//         </motion.div>

//         <div className="flex w-full flex-row justify-between">
//           {usages.map((usage, index) => (
//             <div
//               key={usage.day}
//               className="relative flex h-[150px] flex-col items-center gap-1 text-sm"
//             >
//               <motion.div
//                 key={`total-${usage.day}`}
//                 className={`w-2 bg-${color}-${
//                   type === 'electricity' ? 100 : 500
//                 } mt-auto rounded-md`}
//                 initial={{ height: 0 }}
//                 animate={{ height: usageToHeight(usage.amount) }}
//                 transition={{ delay: index * 0.05 }}
//               />
//               {type === 'electricity' && (
//                 <motion.div
//                   key={`clean-${usage.day}`}
//                   className={`absolute w-2 bg-${color}-500 bottom-5 mt-auto rounded-md`}
//                   initial={{ height: 0 }}
//                   animate={{ height: usageToHeight(usage.clean) }}
//                   transition={{ delay: 0.3 + index * 0.05 }}
//                 />
//               )}
//               <motion.div
//                 className="text-xs text-zinc-500"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//               >
//                 {usage.day}
//               </motion.div>
//             </div>
//           ))}
//         </div>

//         <motion.div
//           className="flex flex-col gap-1"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 1 }}
//         >
//           <div className="flex flex-row items-center gap-2">
//             <div className={`size-3 bg-${color}-100 rounded-sm`} />
//             <div className="text-xs text-zinc-500">Total</div>
//           </div>
//           {type === 'electricity' && (
//             <div className="flex flex-row items-center gap-2">
//               <div className={`dark:bg size-3 bg-${color}-500 rounded-sm`} />
//               <div className="text-xs text-zinc-500">Clean</div>
//             </div>
//           )}
//         </motion.div>
//       </div>

//       <div className="hidden bg-blue-500" />
//       <div className="hidden bg-green-500" />
//       <div className="hidden bg-orange-500" />
//       <div className="hidden bg-blue-100" />
//       <div className="hidden bg-green-100" />
//       <div className="hidden bg-orange-100" />
//     </div>
//   );
// };
