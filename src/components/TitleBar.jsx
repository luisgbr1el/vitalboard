import { TbMinus, TbSquare, TbX } from 'react-icons/tb';
import '../styles/TitleBar.css';

function TitleBar() {
  const isElectron = window.appInfo?.isElectron;

  if (!isElectron) return null;

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow();
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow();
  };

  return (
    <div className="title-bar">
      <div className="title-bar-drag-region"></div>
      <div className="title-bar-buttons">
        <button className="title-bar-button" onClick={handleMinimize} title="Minimize">
          <TbMinus size={16} />
        </button>
        <button className="title-bar-button" onClick={handleMaximize} title="Maximize">
          <TbSquare size={14} />
        </button>
        <button className="title-bar-button title-bar-close" onClick={handleClose} title="Close">
          <TbX size={16} />
        </button>
      </div>
    </div>
  );
}

export default TitleBar;
