<script setup>
const props = defineProps({
  fields: {
    type: Object,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:fields'])

function updateField(key, value) {
  emit('update:fields', {
    ...props.fields,
    [key]: value,
  })
}
</script>

<template>
  <section class="space-y-4">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <label class="input-lbl" for="seo-brand">Watch Brand</label>
        <input
          id="seo-brand"
          :value="fields.brand"
          type="text"
          class="input"
          placeholder="e.g. Omega"
          :disabled="disabled"
          @input="updateField('brand', $event.target.value)"
        />
      </div>

      <div class="space-y-2">
        <label class="input-lbl" for="seo-model">Watch Model</label>
        <input
          id="seo-model"
          :value="fields.model"
          type="text"
          class="input"
          placeholder="e.g. Seamaster"
          :disabled="disabled"
          @input="updateField('model', $event.target.value)"
        />
      </div>
    </div>
  </section>
</template>
