import { useState, useEffect, useRef } from 'react';
import '../styles/Modal.css';
import { MdOutlineImage } from "react-icons/md";
import { TbBrandGithub, TbBrandX, TbMail } from "react-icons/tb";
import FileSessionManager from '../utils/fileSessionManager.js';
import { useI18n } from '../i18n/i18nContext';
import { useAlert } from '../hooks/useAlert';
import apiConfig from '../utils/apiConfig.js';

function SettingsModal({ isOpen, onClose, onUpdate }) {
    const { t, changeLocale } = useI18n();
    const [activeTab, setActiveTab] = useState("general");
    const [language, setLanguage] = useState("pt-BR");
    const [showIcon, setShowIcon] = useState(true);
    const [showCharacterIcon, setShowCharacterIcon] = useState(true);
    const [showHealth, setShowHealth] = useState(true);
    const [showName, setShowName] = useState(true);
    const [fontSize, setFontSize] = useState(14);
    const [fontColor, setFontColor] = useState("#FFFFFF");
    const [iconsSize, setIconsSize] = useState(64);
    const [characterIconSize, setCharacterIconSize] = useState(170);
    const [healthIconFilePath, setHealthIconFilePath] = useState(null);
    const [fontFamily, setFontFamily] = useState(null);
    const [currentHealthIconFileName, setCurrentHealthIconFileName] = useState("");
    const { showAlert } = useAlert();

    const fileSessionRef = useRef(new FileSessionManager());

    useEffect(() => {
        if (isOpen) {
            setActiveTab("general");
            initializeAndFetchSettings();
        }
    }, [isOpen]);

    const initializeAndFetchSettings = async () => {
        await apiConfig.initialize();
        fetchSettings();
    };

    const fetchSettings = async () => {
        try {
            const response = await fetch(apiConfig.getApiUrl('/settings'));
            if (response.ok) {
                const settings = await response.json();
                setLanguage(settings.general.language);
                setShowIcon(settings.overlay.show_icon);
                setShowCharacterIcon(settings.overlay.show_character_icon);
                setShowHealth(settings.overlay.show_health);
                setShowName(settings.overlay.show_name);
                setFontSize(settings.overlay.font_size);
                setFontFamily(settings.overlay.font_family);
                setFontColor(settings.overlay.font_color);
                setIconsSize(settings.overlay.icons_size);
                setCharacterIconSize(settings.overlay.character_icon_size || 170);
                setHealthIconFilePath(settings.overlay.health_icon_file_path);
                setCurrentHealthIconFileName("");
            } else
                console.error('Error loading settings:', response.statusText);
        } catch (error) {
            console.error('Network error fetching settings:', error);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        await apiConfig.initialize();

        if (currentHealthIconFileName)
            await fileSessionRef.current.confirmFile(currentHealthIconFileName);

        const settingsData = {
            general: {
                language
            },
            overlay: {
                show_icon: showIcon,
                show_character_icon: showCharacterIcon,
                show_health: showHealth,
                show_name: showName,
                font_size: fontSize,
                font_family: fontFamily,
                font_color: fontColor,
                icons_size: iconsSize,
                character_icon_size: characterIconSize,
                health_icon_file_path: healthIconFilePath
            }
        };

        try {
            const response = await fetch(apiConfig.getApiUrl('/settings'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settingsData)
            });

            if (response.ok) {
                changeLocale(language);
                onUpdate(settingsData);
                showAlert('success', t('settings.updated'))
            } else {
                console.error('Error saving settings:', response.statusText);
                showAlert('error', t('validation.save_error'));
            }
        } catch (error) {
            console.error('Network error saving settings:', error);
            showAlert('error', t('validation.save_error'));
        }
    };

    const handleClose = async () => {
        if (currentHealthIconFileName)
            await fileSessionRef.current.cleanupSession();

        fileSessionRef.current.resetSession();
        setCurrentHealthIconFileName("");

        onClose();
    };

    const handleHealthIconUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                if (currentHealthIconFileName)
                    await fileSessionRef.current.deleteFile(currentHealthIconFileName);

                const data = await fileSessionRef.current.uploadFile(file);
                setHealthIconFilePath(data.url);
                setCurrentHealthIconFileName(data.fileName);
            } catch (error) {
                console.error('Error uploading health icon:', error);
                showAlert('error', t('validation.upload_error'));
            }
        }
    };

    return (
        <>
            <div className="modal-overlay">
                <div className="modal-content" style={{ maxWidth: '70%' }}>
                    <h2 className="title">{t('settings.title')}</h2>
                    <div className="sidebar-modal">
                        <div className='modal-navbar'>
                            <ul>
                                <li className={`navbar-button ${activeTab === "general" ? "active" : ""}`} onClick={() => setActiveTab("general")}>
                                    {t('settings.general')}
                                </li>
                                <li className={`navbar-button ${activeTab === "overlay" ? "active" : ""}`} onClick={() => setActiveTab("overlay")}>
                                    {t('settings.overlay')}
                                </li>
                                <li className={`navbar-button ${activeTab === "about" ? "active" : ""}`} onClick={() => setActiveTab("about")}>
                                    {t('settings.about')}
                                </li>
                            </ul>
                        </div>
                        <div className='modal-general-column'>
                            <form onSubmit={handleSubmit}>
                                {activeTab === "general" && (
                                    <div className="modal-column modal-full-width">
                                        <h4 className='title'>{t('settings.application')}</h4>
                                        <label>
                                            <p className='button-text'>{t('settings.language')}</p>
                                            <select value={language} onChange={(e) => setLanguage(e.target.value)} required>
                                                <option value="en-US">English (US)</option>
                                                <option value="pt-BR">Português (Brasil)</option>
                                            </select>
                                        </label>
                                    </div>
                                )}

                                {activeTab === "overlay" && (
                                    <div className="modal-column modal-full-width">
                                        <h4 className='title'>{t('settings.components')}</h4>
                                        <div className="modal-row">
                                            <label className='inline-label'>
                                                <p className='button-text'>{t('settings.show_name')}</p>
                                                <input
                                                    type="checkbox"
                                                    className="toggle-checkbox"
                                                    checked={showName}
                                                    onChange={(e) => setShowName(e.target.checked)}
                                                />
                                            </label>
                                        </div>
                                        <div className="modal-row">
                                            <label className='inline-label'>
                                                <p className='button-text'>{t('settings.show_hp')}</p>
                                                <input
                                                    type="checkbox"
                                                    className="toggle-checkbox"
                                                    checked={showHealth}
                                                    onChange={(e) => setShowHealth(e.target.checked)}
                                                />
                                            </label>
                                        </div>
                                        <div className="modal-row">
                                            <label className='inline-label'>
                                                <p className='button-text'>{t('settings.show_hp_icon')}</p>
                                                <input
                                                    type="checkbox"
                                                    className="toggle-checkbox"
                                                    checked={showIcon}
                                                    onChange={(e) => setShowIcon(e.target.checked)}
                                                />
                                            </label>
                                        </div>
                                        <div className="modal-row">
                                            <label className='inline-label'>
                                                <p className='button-text'>{t('settings.show_character_icon')}</p>
                                                <input
                                                    type="checkbox"
                                                    className="toggle-checkbox"
                                                    checked={showCharacterIcon}
                                                    onChange={(e) => setShowCharacterIcon(e.target.checked)}
                                                />
                                            </label>
                                        </div>
                                        <h4 className='title'>{t('settings.text')}</h4>
                                        <label>
                                            <p className='button-text'>{t('settings.font')}</p>
                                            <select value={fontFamily || "Poppins"} onChange={(e) => setFontFamily(e.target.value)} required>
                                                <option style={{ fontFamily: "Arial" }} value="Arial">Arial</option>
                                                <option style={{ fontFamily: "Poppins" }} value="Poppins">Poppins</option>
                                                <option style={{ fontFamily: "Times New Roman" }} value="Times New Roman">Times New Roman</option>
                                                <option style={{ fontFamily: "Courier New" }} value="Courier New">Courier New</option>
                                                <option style={{ fontFamily: "Helvetica" }} value="Helvetica">Helvetica</option>
                                                <option style={{ fontFamily: "Georgia" }} value="Georgia">Georgia</option>
                                                <option style={{ fontFamily: "Verdana" }} value="Verdana">Verdana</option>
                                                <option style={{ fontFamily: "Impact" }} value="Impact">Impact</option>
                                                <option style={{ fontFamily: "Comic Sans MS" }} value="Comic Sans MS">Comic Sans MS</option>
                                                <option style={{ fontFamily: "Trebuchet MS" }} value="Trebuchet MS">Trebuchet MS</option>
                                                <option style={{ fontFamily: "Arial Black" }} value="Arial Black">Arial Black</option>
                                                <option style={{ fontFamily: "Palatino" }} value="Palatino">Palatino</option>
                                            </select>
                                        </label>
                                        <div className="modal-row">
                                            <label>
                                                <p className='button-text'>{t('settings.font_size')}</p>
                                                <input
                                                    type="number"
                                                    value={fontSize}
                                                    onChange={(e) => setFontSize(parseInt(e.target.value) || 14)}
                                                    min="8"
                                                    max="72"
                                                    required
                                                />
                                            </label>
                                            <label>
                                                <p className='button-text'>{t('settings.font_color')}</p>
                                                <input
                                                    type="color"
                                                    value={fontColor}
                                                    onChange={(e) => setFontColor(e.target.value)}
                                                    required
                                                />
                                            </label>
                                        </div>

                                        <h4 className='title'>{t('settings.icons')}</h4>
                                        <div className="modal-row">
                                            <label>
                                                <p className='button-text'>{t('settings.hp_icon_size')}</p>
                                                <input
                                                    type="number"
                                                    value={iconsSize}
                                                    onChange={(e) => setIconsSize(parseInt(e.target.value) || 64)}
                                                    min="16"
                                                    max="256"
                                                    required
                                                />
                                            </label>
                                            <label>
                                                <p className='button-text'>{t('settings.character_icon_size')}</p>
                                                <input
                                                    type="number"
                                                    value={characterIconSize}
                                                    onChange={(e) => setCharacterIconSize(parseInt(e.target.value) || 170)}
                                                    min="32"
                                                    max="512"
                                                    required
                                                />
                                            </label>
                                        </div>
                                        <div className="modal-row">
                                            <label>
                                                <p className='button-text'>{t('settings.hp_icon')}</p>
                                                <div id="icon-preview-container" style={{ width: '50px', height: '50px' }} className={healthIconFilePath ? 'has-image' : ''}>
                                                    <input type="file" accept="image/*" onChange={handleHealthIconUpload} />
                                                    <MdOutlineImage size={60} />
                                                    {healthIconFilePath && <img src={healthIconFilePath} alt="Ícone de vida" />}
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "about" && (
                                    <div className="modal-column modal-full-width">
                                        <h4 className='title'>{t('settings.version_build')}</h4>
                                        <div className="modal-row">
                                            <label className='inline-label'>
                                                <p className='button-text'>v1.0.0-alpha (Icarus)</p>
                                            </label>
                                        </div>
                                        <h4 className='title'>{t('settings.contact')}</h4>
                                        <div className="modal-row">
                                            <label className="no-flex-label">
                                                <a href="https://github.com/luisgbr1el/vitalboard" className="button" target="_blank" rel="noopener noreferrer">
                                                    <TbBrandGithub size={20} />
                                                </a>
                                                <a href="https://x.com/luisgbr1el" className="button" target="_blank" rel="noopener noreferrer">
                                                    <TbBrandX size={20} />
                                                </a>
                                                <a href="mailto:luisgabrielaraujo8@gmail.com" className="button" target="_blank" rel="noopener noreferrer">
                                                    <TbMail size={20} />
                                                </a>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button className="button" type="submit" onClick={handleSubmit}>
                            {t('common.save')}
                        </button>
                        <button className="button" type="button" onClick={handleClose}>
                            {t('common.cancel')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SettingsModal;