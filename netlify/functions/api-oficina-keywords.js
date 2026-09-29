import { getStore } from "@netlify/blobs";

const SEED_KEYWORDS = [
  { departamento: "Contabilidad", palabras: ["factura", "pago", "gasto", "presupuesto", "cobro", "nomina"] },
  { departamento: "Compras", palabras: ["pedido", "proveedor", "compra", "material", "presupuesto"] },
  { departamento: "RRHH", palabras: ["vacaciones", "contrato", "baja", "nomina", "personal", "horario"] },
  { departamento: "IT", palabras: ["ordenador", "software", "wifi", "correo", "impresora", "acceso", "password", "contraseña"] },
  { departamento: "Calidad", palabras: ["no conformidad", "calibracion", "auditoria", "norma", "iso"] },
  { departamento: "I+D", palabras: ["diseño", "prototipo", "ensayo", "desarrollo", "investigacion"] },
  { departamento: "Producción", palabras: ["linea", "maquina", "produccion", "averia", "pieza"] },
  { departamento: "Logística", palabras: ["envio", "transporte", "almacen", "stock", "entrega"] },
  { departamento: "Comercial", palabras: ["cliente", "venta", "oferta", "presupuesto", "pedido"] },
  { departamento: "Dirección", palabras: ["reunion", "estrategia", "decision"] }
];

export default async (request) => {
  try {
    const store = getStore("oficina");
    let keywords = await store.get("keywords", { type: "json" });

    if (!keywords) {
      keywords = SEED_KEYWORDS;
      await store.setJSON("keywords", keywords);
    }

    return new Response(JSON.stringify({ keywords }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = {
  path: "/api/oficina-keywords"
};
