export default function DetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <p style={{ color: 'var(--taupe-light)', fontSize: '0.875rem' }}>
        ID: {params.id}
      </p>
    </div>
  );
}
