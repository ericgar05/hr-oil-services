export const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = (open) => {
    setIsOpen(open);
  };

  return {
    isOpen,
    toggleSidebar,
  };
};
