import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../contexts/AuthContext';
import { subastasApi } from '../api/subastas';
import { pujasApi } from '../api/pujas';
import { seguimientosApi } from '../api/seguimientos';
import type { SubastaResponse, PujaResponse, ResultadoPujaResponse } from '../types';
import { formatCurrency, formatDate, generateUUID } from '../utils/format';
import { CATEGORIAS } from '../utils/constants';
import { mediaUrl } from '../utils/media';
import EstadoBadge from '../components/EstadoBadge';
import Countdown from '../components/Countdown';
import { Clock, Tag, User, AlertCircle, CheckCircle, XCircle, Heart, HeartOff, ArrowLeft, ArrowRight, Pencil, Save, Trash2, Upload, X } from 'lucide-react';

export default function SubastaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const subastaId = Number(id);

  const [subasta, setSubasta] = useState<SubastaResponse | null>(null);
  const [pujas, setPujas] = useState<PujaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pujaMonto, setPujaMonto] = useState('');
  const [pujando, setPujando] = useState(false);
  const [pujaResultado, setPujaResultado] = useState<ResultadoPujaResponse | null>(null);
  const [siguiendo, setSiguiendo] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState<number | null>(null);
  const [fotosError, setFotosError] = useState<string | null>(null);
  const [gestionandoFotos, setGestionandoFotos] = useState(false);
  const [editando, setEditando] = useState(false);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [edicionError, setEdicionError] = useState<string | null>(null);
  const [datosEdicion, setDatosEdicion] = useState({ nombreProducto: '', descripcionProducto: '', categoriaProducto: '', marcaProducto: '', modeloProducto: '' });

  const load = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError(null);
    try {
      const [s, p] = await Promise.all([
        subastasApi.obtener(subastaId),
        pujasApi.listarPorSubasta(subastaId),
      ]);
      setSubasta(s);
      setPujas(p);
      if (user) {
        try {
          const seguidas = await seguimientosApi.misSeguimientos();
          setSiguiendo(seguidas.some(item => item.id === subastaId));
        } catch {
          setSiguiendo(false);
        }
      } else {
        setSiguiendo(false);
      }
    } catch (e: unknown) {
      setError((e as { mensaje?: string }).mensaje ?? 'No se pudieron cargar los datos de la subasta');
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [subastaId, user]);

  useEffect(() => { void load(); }, [load]);

  // Mantiene actualizados el precio y el historial cuando otro usuario oferta.
  useEffect(() => {
    if (!subastaId) return;
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/subastas/${subastaId}/pujas`, () => void load(false));
        client.subscribe(`/topic/subastas/${subastaId}/estado`, () => void load(false));
      },
    });
    client.activate();
    return () => { void client.deactivate(); };
  }, [subastaId, load]);

  const handlePuja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subasta) return;
    setPujando(true);
    setPujaResultado(null);
    try {
      const monto = Number(pujaMonto);
      const res = await pujasApi.pujar(subastaId, { monto, identificadorSolicitud: generateUUID() });
      setPujaResultado(res);
      if (res.aceptada) {
        setPujaMonto('');
      }
      await load(false);
    } catch (e: unknown) {
      setPujaResultado({
        aceptada: false,
        precioActual: subasta.precioActual,
        mensaje: (e as { mensaje?: string }).mensaje ?? 'Error al pujar',
        motivoRechazo: '',
      });
      await load(false);
    } finally {
      setPujando(false);
    }
  };

  const handleSeguir = async () => {
    if (!user) return navigate('/login');
    try {
      if (siguiendo) {
        await seguimientosApi.dejarDeSeguir(subastaId);
      } else {
        await seguimientosApi.seguir(subastaId);
      }
      setSiguiendo(!siguiendo);
    } catch {
      // ignore
    }
  };

  const handleSubirFotos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const seleccionadas = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!subasta || !seleccionadas.length) return;
    if ((subasta.fotos?.length ?? 0) + seleccionadas.length > 10) {
      setFotosError('La subasta permite hasta 10 fotos en total.');
      return;
    }
    if (seleccionadas.some(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setFotosError('Cada imagen debe ser JPEG, PNG o WebP y pesar como máximo 5 MB.');
      return;
    }
    setGestionandoFotos(true);
    setFotosError(null);
    try {
      for (const file of seleccionadas) await subastasApi.subirFoto(subastaId, file);
      await load(false);
    } catch (e: unknown) {
      setFotosError((e as { mensaje?: string }).mensaje ?? 'No se pudieron subir las fotos.');
    } finally {
      setGestionandoFotos(false);
    }
  };

  const handleEliminarFoto = async (fotoId: number) => {
    if (!window.confirm('¿Eliminar esta foto de la subasta?')) return;
    setGestionandoFotos(true);
    setFotosError(null);
    try {
      await subastasApi.eliminarFoto(subastaId, fotoId);
      if (fotoSeleccionada === fotoId) setFotoSeleccionada(null);
      await load(false);
    } catch (e: unknown) {
      setFotosError((e as { mensaje?: string }).mensaje ?? 'No se pudo eliminar la foto.');
    } finally {
      setGestionandoFotos(false);
    }
  };

  const moverFoto = async (indice: number, direccion: -1 | 1) => {
    if (!subasta) return;
    const fotosOrdenadas = [...subasta.fotos].sort((a, b) => a.orden - b.orden);
    const destino = indice + direccion;
    if (destino < 0 || destino >= fotosOrdenadas.length) return;
    [fotosOrdenadas[indice], fotosOrdenadas[destino]] = [fotosOrdenadas[destino], fotosOrdenadas[indice]];
    setGestionandoFotos(true);
    setFotosError(null);
    try {
      await subastasApi.ordenarFotos(subastaId, fotosOrdenadas.map(item => item.id));
      await load(false);
    } catch (e: unknown) {
      setFotosError((e as { mensaje?: string }).mensaje ?? 'No se pudo cambiar el orden de las fotos.');
    } finally {
      setGestionandoFotos(false);
    }
  };

  const guardarEdicion = async (event: React.FormEvent) => {
    event.preventDefault();
    setGuardandoEdicion(true);
    setEdicionError(null);
    try {
      await subastasApi.actualizar(subastaId, datosEdicion);
      setEditando(false);
      await load(false);
    } catch (e: unknown) {
      setEdicionError((e as { mensaje?: string }).mensaje ?? 'No se pudieron guardar los cambios.');
    } finally {
      setGuardandoEdicion(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}><div className="spinner" /></div>;
  }

  if (error || !subasta) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
        <AlertCircle size={48} color="var(--color-error)" style={{ margin: '0 auto var(--space-4)' }} />
        <h2 style={{ marginBottom: 'var(--space-2)' }}>No se pudo abrir la subasta</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>{error}</p>
      </div>
    );
  }

  const foto = subasta.fotos?.find(f => f.id === fotoSeleccionada)
    ?? subasta.fotos?.find(f => f.esPrincipal)
    ?? subasta.fotos?.[0];
  const esVendedor = user && (user.id === subasta.vendedorId);
  const puedePujar = subasta.estado === 'ACTIVA' && user && !esVendedor;
  const subastaActiva = subasta.estado === 'ACTIVA';
  const montoMinimo = subasta.precioActual + subasta.incrementoMinimo;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Breadcrumb */}
      <button onClick={() => navigate('/')} style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
        fontSize: '0.85rem', color: 'var(--color-primary)', marginBottom: 'var(--space-6)',
      }}>
        ← Volver a subastas
      </button>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)',
        background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)', overflow: 'hidden',
      }}>
        {/* Image */}
        <div>
          <div style={{ minHeight: 400, background: 'var(--color-bg)' }}>
            {foto && <img src={mediaUrl(foto.url)} alt={foto.nombreArchivo ?? subasta.nombreProducto} style={{ display: 'block', width: '100%', minHeight: 400, maxHeight: 560, objectFit: 'contain' }} />}
          </div>
          {(subasta.fotos?.length ?? 0) > 1 && (
            <div style={{ display: 'flex', gap: 'var(--space-2)', padding: 'var(--space-3)', overflowX: 'auto' }}>
              {subasta.fotos.map((imagen, index) => (
                <button
                  key={imagen.id}
                  type="button"
                  aria-label={`Ver foto ${index + 1}`}
                  aria-pressed={foto?.id === imagen.id}
                  onClick={() => setFotoSeleccionada(imagen.id)}
                  style={{
                    flex: '0 0 64px', width: 64, height: 64,
                    background: `url(${mediaUrl(imagen.url)}) center/cover no-repeat`,
                    border: foto?.id === imagen.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          )}
          {esVendedor && (
            <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
              <label htmlFor="agregar-fotos" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-primary)', fontWeight: 600, cursor: gestionandoFotos ? 'wait' : 'pointer' }}>
                <Upload size={16} /> {gestionandoFotos ? 'Actualizando fotos...' : 'Agregar fotos'}
                <input id="agregar-fotos" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={gestionandoFotos} onChange={handleSubirFotos} style={{ display: 'none' }} />
              </label>
              <p style={{ marginTop: 'var(--space-1)', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>Hasta 10 imágenes · JPEG, PNG o WebP · 5 MB máximo cada una</p>
              {fotosError && <p role="alert" style={{ color: 'var(--color-error)', fontSize: '0.82rem', marginTop: 'var(--space-2)' }}>{fotosError}</p>}
              {(subasta.fotos ?? []).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                  {[...subasta.fotos].sort((a, b) => a.orden - b.orden).map((imagen, index, lista) => (
                    <div key={imagen.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.8rem' }}>
                      <span style={{ flex: 1 }}>{imagen.esPrincipal ? 'Principal · ' : ''}{imagen.nombreArchivo}</span>
                      <button type="button" aria-label="Mover foto a la izquierda" disabled={gestionandoFotos || index === 0} onClick={() => void moverFoto(index, -1)}><ArrowLeft size={15} /></button>
                      <button type="button" aria-label="Mover foto a la derecha" disabled={gestionandoFotos || index === lista.length - 1} onClick={() => void moverFoto(index, 1)}><ArrowRight size={15} /></button>
                      <button type="button" aria-label="Eliminar foto" disabled={gestionandoFotos} onClick={() => void handleEliminarFoto(imagen.id)} style={{ color: 'var(--color-error)' }}><Trash2 size={15} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: 'var(--space-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
            <EstadoBadge estado={subasta.estado} />
            <button onClick={handleSeguir} style={{ color: siguiendo ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
              {siguiendo ? <Heart size={20} fill="var(--color-error)" /> : <HeartOff size={20} />}
            </button>
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
            {subasta.nombreProducto}
          </h1>

          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>
            {subasta.descripcionProducto}
          </p>

          {/* Meta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              <Tag size={14} /> {subasta.categoriaProducto}
              {subasta.marcaProducto && <><span style={{ margin: '0 var(--space-1)' }}>·</span> {subasta.marcaProducto}</>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              <User size={14} /> @{subasta.vendedorUsername}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              <Clock size={14} /> Cierra: {formatDate(subasta.fechaFin)}
            </div>
          </div>

          {/* Prices */}
          <div style={{
            background: 'var(--color-bg)', borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)', marginBottom: 'var(--space-6)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Precio base</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{formatCurrency(subasta.precioBase)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Precio actual</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                {formatCurrency(subasta.precioActual)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Incremento mínimo</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{formatCurrency(subasta.incrementoMinimo)}</span>
            </div>
            {subasta.estado === 'ACTIVA' && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Tiempo restante</span>
                <Countdown seconds={subasta.segundosRestantes} />
              </div>
            )}
          </div>

          {/* Puja form */}
          {puedePujar && (
            <form onSubmit={handlePuja} style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
                Tu oferta (mín. {formatCurrency(montoMinimo)})
              </label>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input
                  type="number"
                  step="0.01"
                  min={montoMinimo}
                  value={pujaMonto}
                  onChange={e => setPujaMonto(e.target.value)}
                  required
                  placeholder={montoMinimo.toFixed(2)}
                  style={{
                    flex: 1, padding: 'var(--space-3) var(--space-4)',
                    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem', outline: 'none',
                  }}
                />
                <button type="submit" disabled={pujando} style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: 'var(--color-primary)', color: '#fff',
                  border: 'none', borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem', fontWeight: 600,
                  opacity: pujando ? 0.7 : 1,
                }}>
                  {pujando ? 'Pujando...' : 'Pujar'}
                </button>
              </div>
            </form>
          )}

          {subastaActiva && !user && (
            <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ marginBottom: 'var(--space-2)', fontSize: '0.9rem' }}>La subasta está activa. Iniciá sesión para ofertar.</p>
              <button onClick={() => navigate('/login')} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Iniciar sesión</button>
            </div>
          )}

          {subasta.estado === 'PROGRAMADA' && (
            <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              La subasta todavía no comenzó. Las pujas estarán disponibles desde {formatDate(subasta.fechaInicio)}.
            </p>
          )}
          {subasta.estado === 'BORRADOR' && esVendedor && (
            <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Este borrador aún no está publicado. Publicalo desde “Mis subastas” para que otros puedan participar.
            </p>
          )}
          {subastaActiva && esVendedor && (
            <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              No podés ofertar en tu propia subasta. Otro usuario debe iniciar sesión para participar.
            </p>
          )}

          {/* Puja resultado */}
          {pujaResultado && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              background: pujaResultado.aceptada ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
              color: pujaResultado.aceptada ? 'var(--color-success)' : 'var(--color-error)',
              fontSize: '0.85rem',
            }}>
              {pujaResultado.aceptada ? <CheckCircle size={16} /> : <XCircle size={16} />}
              <span>{pujaResultado.mensaje}{pujaResultado.motivoRechazo ? ` · ${pujaResultado.motivoRechazo}` : ''}</span>
            </div>
          )}

          {/* Ganador */}
          {subasta.ganador && (
            <div style={{
              marginTop: 'var(--space-4)', padding: 'var(--space-4)',
              background: 'var(--color-success-bg)', borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              color: 'var(--color-success)', fontSize: '0.9rem', fontWeight: 500,
            }}>
              <CheckCircle size={18} />
              Ganador: {subasta.ganador.nombre} {subasta.ganador.apellido}
            </div>
          )}
        </div>
      </div>

      {esVendedor && (
        <section style={{ marginTop: 'var(--space-6)', padding: 'var(--space-5)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Administrar publicación</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginTop: 4 }}>
                {subasta.estado === 'BORRADOR' || subasta.estado === 'PROGRAMADA' ? 'Podés editar los datos mientras la subasta no esté activa.' : 'Los datos quedan bloqueados cuando comienza la subasta; las fotos siguen siendo administrables.'}
              </p>
            </div>
            {!editando && (subasta.estado === 'BORRADOR' || subasta.estado === 'PROGRAMADA') && (
              <button type="button" onClick={() => {
                setDatosEdicion({ nombreProducto: subasta.nombreProducto, descripcionProducto: subasta.descripcionProducto, categoriaProducto: subasta.categoriaProducto, marcaProducto: subasta.marcaProducto ?? '', modeloProducto: subasta.modeloProducto ?? '' });
                setEditando(true);
              }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-primary)', fontWeight: 600 }}><Pencil size={16} /> Editar datos</button>
            )}
          </div>
          {editando && (
            <form onSubmit={guardarEdicion} style={{ display: 'grid', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              {edicionError && <p role="alert" style={{ color: 'var(--color-error)' }}>{edicionError}</p>}
              <input aria-label="Nombre del producto" required maxLength={200} value={datosEdicion.nombreProducto} onChange={e => setDatosEdicion(prev => ({ ...prev, nombreProducto: e.target.value }))} />
              <textarea aria-label="Descripción" required maxLength={5000} rows={4} value={datosEdicion.descripcionProducto} onChange={e => setDatosEdicion(prev => ({ ...prev, descripcionProducto: e.target.value }))} />
              <select aria-label="Categoría" required value={datosEdicion.categoriaProducto} onChange={e => setDatosEdicion(prev => ({ ...prev, categoriaProducto: e.target.value }))}>
                {CATEGORIAS.map(categoria => <option key={categoria} value={categoria}>{categoria}</option>)}
              </select>
              <input aria-label="Marca" maxLength={100} placeholder="Marca" value={datosEdicion.marcaProducto} onChange={e => setDatosEdicion(prev => ({ ...prev, marcaProducto: e.target.value }))} />
              <input aria-label="Modelo" maxLength={100} placeholder="Modelo" value={datosEdicion.modeloProducto} onChange={e => setDatosEdicion(prev => ({ ...prev, modeloProducto: e.target.value }))} />
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button type="submit" disabled={guardandoEdicion} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-primary)', fontWeight: 600 }}><Save size={16} /> {guardandoEdicion ? 'Guardando...' : 'Guardar cambios'}</button>
                <button type="button" disabled={guardandoEdicion} onClick={() => setEditando(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><X size={16} /> Cancelar</button>
              </div>
            </form>
          )}
        </section>
      )}

      {/* Pujas history */}
      <div style={{ marginTop: 'var(--space-8)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          Historial de pujas ({pujas.length})
        </h2>
        {pujas.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Aún no hay pujas en esta subasta.
          </p>
        ) : (
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', overflow: 'hidden',
          }}>
            {pujas.map((puja, i) => (
              <div key={puja.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 'var(--space-3) var(--space-4)',
                borderBottom: i < pujas.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 600,
                  }}>
                    {puja.postorUsername[0].toUpperCase()}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>@{puja.postorUsername}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formatDate(puja.fechaHora)}</div>
                  </div>
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {formatCurrency(puja.monto)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
