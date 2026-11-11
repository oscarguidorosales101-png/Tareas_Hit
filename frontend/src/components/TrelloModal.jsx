import React, { useState, useEffect } from 'react';
import { trelloService } from '../services/trelloService.js';
import { useToast } from '../context/ToastContext.jsx';
import { X, ExternalLink, Download, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export const TrelloModal = ({ isOpen, onClose, currentBoardId, currentListId, onImportSuccess }) => {
  const { showToast } = useToast();
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trelloBoards, setTrelloBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [trelloLists, setTrelloLists] = useState([]);
  const [selectedList, setSelectedList] = useState('');
  const [trelloCards, setTrelloCards] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const data = await trelloService.getStatus();
      setStatus(data);
      if (data.configured) {
        const boards = await trelloService.getBoards();
        setTrelloBoards(boards);
        if (boards.length > 0) {
          setSelectedBoard(boards[0].id);
          loadLists(boards[0].id);
        }
      }
    } catch (err) {
      showToast(err.message || 'Error consultando Trello', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLists = async (boardId) => {
    try {
      const lists = await trelloService.getLists(boardId);
      setTrelloLists(lists);
      if (lists.length > 0) {
        setSelectedList(lists[0].id);
        loadCards(lists[0].id);
      } else {
        setTrelloCards([]);
      }
    } catch (err) {
      showToast('Error cargando listas de Trello', 'error');
    }
  };

  const loadCards = async (listId) => {
    try {
      const cards = await trelloService.getCards(listId);
      setTrelloCards(cards);
    } catch (err) {
      showToast('Error cargando tarjetas de Trello', 'error');
    }
  };

  const handleBoardChange = (e) => {
    const id = e.target.value;
    setSelectedBoard(id);
    loadLists(id);
  };

  const handleListChange = (e) => {
    const id = e.target.value;
    setSelectedList(id);
    loadCards(id);
  };

  const handleImportCard = async (cardId) => {
    setIsImporting(true);
    try {
      await trelloService.importCard({
        cardId,
        localBoardId: currentBoardId,
        localListId: currentListId
      });
      showToast('Tarjeta de Trello importada exitosamente a tu tablero', 'success');
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      showToast(err.message || 'Error importando tarjeta', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3b82f6'
              }}
            >
              <ExternalLink size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                Integración Oficial con Trello (Opcional)
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Conexión segura y directa desde el backend
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem auto' }} />
              <div>Consultando estado de integración con Trello...</div>
            </div>
          ) : !status?.configured ? (
            <div>
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 10,
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <AlertCircle size={18} /> Integración no configurada
                </div>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                  La integración oficial con Trello es <strong>completamente opcional</strong>. Para activarla, añade tus credenciales privadas en el archivo <code style={{ color: '#38bdf8' }}>backend/.env</code>:
                </p>
                <pre
                  style={{
                    backgroundColor: '#07090e',
                    padding: '0.75rem',
                    borderRadius: 6,
                    marginTop: '0.75rem',
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
TRELLO_API_KEY=tu_api_key_aqui&#10;TRELLO_TOKEN=tu_token_aqui
                </pre>
              </div>

              <div style={{ fontSize: '0.825rem', color: '#94a3b8', lineHeight: 1.6 }}>
                <p>
                  <strong>¿Cómo obtenerlas?</strong>
                </p>
                <ol style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
                  <li>Inicia sesión en tu cuenta de Trello.</li>
                  <li>Dirígete a <code style={{ color: '#38bdf8' }}>https://trello.com/power-ups/admin</code>.</li>
                  <li>Genera tu <strong>API Key</strong> y genera un <strong>Token de Acceso</strong>.</li>
                  <li>Guárdalos en <code style={{ color: '#38bdf8' }}>Tareas_Hit/backend/.env</code> y reinicia el servidor.</li>
                </ol>
                <p style={{ marginTop: '0.75rem', color: '#10b981' }}>
                  💡 La gestión local de tareas, tableros Kanban e historial en MySQL funciona al 100% sin necesidad de configurar Trello.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 8,
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem'
                }}
              >
                <CheckCircle2 size={18} />
                <span>API de Trello autenticada y lista para sincronización.</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Tablero de Trello</label>
                  <select className="form-control" value={selectedBoard} onChange={handleBoardChange}>
                    {trelloBoards.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Lista de Trello</label>
                  <select className="form-control" value={selectedList} onChange={handleListChange}>
                    {trelloLists.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>
                TARJETAS DISPONIBLES ({trelloCards.length})
              </div>

              <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {trelloCards.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                    No hay tarjetas en esta lista de Trello
                  </div>
                ) : (
                  trelloCards.map((card) => (
                    <div
                      key={card.id}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#131b2a',
                        border: '1px solid #1e293b',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                        <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {card.name}
                        </div>
                        {card.due && (
                          <div style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                            Vence: {card.due.split('T')[0]}
                          </div>
                        )}
                      </div>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                        onClick={() => handleImportCard(card.id)}
                        disabled={isImporting}
                      >
                        <Download size={13} /> Importar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrelloModal;

