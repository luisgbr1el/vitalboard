import { useState, useEffect } from 'react';
import '../styles/Modal.css';
import { useI18n } from '../i18n/i18nContext';
import { useAlert } from '../hooks/useAlert';
import ConfirmationModal from './ConfirmationModal.jsx';
import { TbUserHexagon } from "react-icons/tb";
import apiConfig from '../utils/apiConfig.js';

function CharacterManagementModal({ isOpen, onClose, characters, onUpdateCharacters }) {
    const { t, locale } = useI18n();
    const { showAlert } = useAlert();
    let [charactersSelected, setCharactersSelected] = useState([]);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [iconExistsMap, setIconExistsMap] = useState({});

    useEffect(() => {
        if (isOpen) {
            setCharactersSelected([]);
            checkAllIcons();
        }
    }, [isOpen, characters]);

    const checkAllIcons = async () => {
        const existsMap = {};
        for (const character of characters) {
            if (character.icon) {
                try {
                    const response = await fetch(character.icon, { method: 'HEAD' });
                    existsMap[character.id] = response.ok;
                } catch (error) {
                    existsMap[character.id] = false;
                }
            } else
                existsMap[character.id] = false;
        }
        setIconExistsMap(existsMap);
    };

    const toggleHiddenButtons = () => {
        let hiddenButtonsDiv = document.getElementById("hidden-actions");
        let importButton = document.getElementById("import-button");

        if (hiddenButtonsDiv) {
            if (charactersSelected.length > 0) {
                hiddenButtonsDiv.style.display = 'flex';
                importButton.style.display = 'none';
            }
            else {
                hiddenButtonsDiv.style.display = 'none';
                importButton.style.display = 'block';
            }
        }
    }

    useEffect(() => {
        if (isOpen) {
            toggleHiddenButtons();
        }
    }, [charactersSelected, isOpen]);

    if (!isOpen) return null;

    const charactersList = characters || [];

    const handleSubmit = async (e) => {
        e.preventDefault();

        handleClose();
    };

    const handleClose = () => {
        setCharactersSelected([]);
        onClose();
    };

    const checkAll = () => {
        const checkboxes = document.querySelectorAll('.selectable-list-item .select-checkbox');

        const characterCheckboxes = Array.from(checkboxes).slice(1);
        const allChecked = characterCheckboxes.every(checkbox => checkbox.checked);

        if (allChecked) {
            characterCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            setCharactersSelected([]);
        } else {
            characterCheckboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
            const allIds = characterCheckboxes.map(checkbox => checkbox.id);
            setCharactersSelected(allIds);
        }

        updateHeaderCheckbox();
    }

    const selectItem = (isChecked, itemId) => {
        if (isChecked && !charactersSelected.includes(itemId)) {
            const newSelected = [...charactersSelected, itemId];
            setCharactersSelected(newSelected);
        } else {
            const newSelected = charactersSelected.filter(id => id !== itemId);
            setCharactersSelected(newSelected);
        }
    }

    const handleIndividualCheckboxChange = (e) => {
        updateHeaderCheckbox();
        selectItem(e.target.checked, e.target.id);
    }

    const updateHeaderCheckbox = () => {
        const checkboxes = document.querySelectorAll('.selectable-list-item .select-checkbox');
        const headerCheckbox = checkboxes[0];
        const characterCheckboxes = Array.from(checkboxes).slice(1);

        const allChecked = characterCheckboxes.every(checkbox => checkbox.checked);
        headerCheckbox.checked = allChecked;
    }

    const handleBatchDelete = async () => {
        if (!charactersSelected || charactersSelected.length === 0) {
            showAlert('error', t('characters.select_one'));
            return;
        }

        try {
            const response = await fetch(apiConfig.getApiUrl('/characters/batch'), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: charactersSelected })
            });

            if (response.ok) {
                const updatedCharacters = charactersList.filter(character => !charactersSelected.includes(character.id));
                onUpdateCharacters(updatedCharacters);
                showAlert('success', t('characters.deleted_batch'));
            } else {
                console.error('Error deleting characters:', response.statusText);
                showAlert('error', t('characters.batch_operation_error'));
            }
        } catch (error) {
            console.error('Error:', error);
        }

        handleClose();
    }

    const handleBatchExport = async () => {
        if (!charactersSelected || charactersSelected.length === 0) {
            showAlert('error', t('characters.select_one'));
            return;
        }

        try {
            const response = await fetch(apiConfig.getApiUrl('/characters/'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                let allCharacters = await response.json();
                let fileContent = [];

                charactersSelected.forEach(selectedId => {
                    fileContent.push(allCharacters.filter(character => character.id == selectedId)[0]);
                })

                const fileHandle = await window.showSaveFilePicker({
                    types: [{
                        accept: { 'text/json': ['.json'] }
                    }],
                    suggestedName: 'characters.vitalboard.json'
                });

                const writable = await fileHandle.createWritable();
                await writable.write(JSON.stringify(fileContent));
                await writable.close();

                showAlert('success', t('characters.exported_batch'));
            } else {
                console.error('Error exporting characters:', response.statusText);
                showAlert('error', t('characters.batch_operation_error'));
            }
        } catch (error) {
            console.error('User aborted operation:', error);
        }
    }

    const handleBatchImport = async () => {
        try {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{
                    accept: { 'text/json': ['.json'] }
                }]
            });

            const file = await fileHandle.getFile();
            const fileContent = await file.text();
            const charactersData = JSON.parse(fileContent);

            const response = await fetch(apiConfig.getApiUrl('/characters/batch'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ characters: charactersData })
            });

            if (response.ok) {
                const charactersResponse = await fetch(apiConfig.getApiUrl('/characters/'), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (charactersResponse.ok) {
                    const updatedCharacters = await charactersResponse.json();
                    onUpdateCharacters(updatedCharacters);
                }

                showAlert('success', t('characters.imported_batch'));
            } else {
                console.error('Error importing characters:', response.statusText);
                showAlert('error', t('characters.batch_operation_error'));
            }
        } catch (error) {
            console.error('User aborted operation:', error);
        }
    }

    const handleOpenConfirmationModal = () => {
        setIsConfirmationModalOpen(true);
    };

    const handleCloseConfirmationModal = () => {
        setIsConfirmationModalOpen(false);
    };

    return (
        <>
            <div className="modal-overlay">
                <div className="modal-content" style={{ maxWidth: "35%" }}>
                    <h2 className="title">{t('characters.manage')}</h2>
                    <form onSubmit={handleSubmit} style={{ marginBottom: 0 }}>
                        <div className="modal-row">
                            <div className="modal-full-width">
                                <div className='selectable-list' style={{ height: 'auto', maxHeight: '300px', padding: '0 10px 10px 0' }}>
                                    <div className="selectable-list-item" style={{ fontWeight: 'bold', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <input className="select-checkbox" type="checkbox" value="false" onChange={checkAll} />
                                            <p>{t('characters.name')}</p>
                                        </div>
                                        <p>{t('characters.created_at')}</p>
                                    </div>
                                    {characters.length === 0 ? (
                                        <p>{t('characters.no_characters')}</p>
                                    ) : (
                                        charactersList.map((character, index) => (
                                            <div key={index} className="selectable-list-item">
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <input id={character.id} className="select-checkbox" type="checkbox" value="false" onChange={handleIndividualCheckboxChange} />
                                                    {(character.icon && iconExistsMap[character.id]) ? (
                                                        <img src={character.icon} className="selectable-list-icon" />
                                                    ) : (
                                                        <div className="selectable-list-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background-secondary)' }}>
                                                            <TbUserHexagon size={24} />
                                                        </div>
                                                    )}
                                                    <p>{character.name}</p>
                                                </div>
                                                <p>{(() => {
                                                    const isoString = character.createdAt;

                                                    if (!isoString)
                                                        return '--';

                                                    try {
                                                        const [datePart, timePart] = isoString.split('T');
                                                        const [year, month, day] = datePart.split('-');
                                                        const [time] = timePart.split('.');
                                                        const [hour, minute, second] = time.split(':');

                                                        const localDate = new Date(year, month - 1, day, hour, minute, second);

                                                        return localDate.toLocaleString(locale, {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        });
                                                    } catch (error) {
                                                        console.error('Error parsing date:', error);
                                                        return '--';
                                                    }
                                                })()}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                    <div className="modal-actions">
                        <div id="hidden-actions" style={{ gap: '5px', display: 'none' }}>
                            <button className="button" type="button" onClick={handleBatchExport}>
                                {t('common.export')}
                            </button>
                            <button className="button" type="button" onClick={handleOpenConfirmationModal}>
                                {t('common.delete')}
                            </button>
                        </div>
                        <button id="import-button" className="button" type="button" onClick={handleBatchImport}>
                            {t('common.import')}
                        </button>
                        <button className="button" type="button" onClick={handleClose}>
                            {t('common.cancel')}
                        </button>
                    </div>
                </div>
            </div>
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={handleCloseConfirmationModal}
                onConfirm={handleBatchDelete}
                text={t('characters.delete_batch_confirm')}
                confirmButtonText={t('common.delete')}
            />
        </>
    );
}

export default CharacterManagementModal;