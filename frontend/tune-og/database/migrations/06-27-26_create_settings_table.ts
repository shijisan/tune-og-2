export default `
CREATE TABLE IF NOT EXISTS settings (
    id PRIMARY KEY,
    audio_source TEXT NOT NULL DEFAULT 'local'
        CHECK (audio_source IN ('local', 'server'))
);
`