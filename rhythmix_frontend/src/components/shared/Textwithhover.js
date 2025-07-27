const TextWithHover = ({ displayText, active, onClick }) => {
  return (
    <div 
      className="text-white font-semibold text-sm cursor-pointer hover:text-gray-300"
      onClick={onClick}
    >
      {displayText}
    </div>
  );
};

export default TextWithHover;

// const TextWithHover = ({ displayText, active }) => {
//   return (
//     <div className="flex items-center justify-start cursor-pointer">
//       <div
//         className={`${
//           active ? "text-white" : "text-gray-500"
//         } font-bold text-lg hover:text-white `}
//       >
//         {displayText}
//       </div>
//     </div>
//   );
// };

// export default TextWithHover;
